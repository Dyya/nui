// NUI core - WebGL2 helpers. Attaches to window.PT for file:// compatibility.
(function(){
  const FULLSCREEN_VS = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

  function createGL(canvas, opts){
    opts = opts || {};
    const gl = canvas.getContext('webgl2', Object.assign({ antialias: true, premultipliedAlpha: false, preserveDrawingBuffer: true }, opts));
    if(!gl) throw new Error('WebGL2 unavailable');
    return gl;
  }

  function compileShader(gl, type, src){
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('Shader compile failed: ' + log + '\n' + src);
    }
    return sh;
  }

  function createProgram(gl, vsSrc, fsSrc){
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
      throw new Error('Program link failed: ' + gl.getProgramInfoLog(prog));
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
  }

  function createFullscreenQuad(gl){
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return { vao: vao, draw: function(){ gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 6); gl.bindVertexArray(null); } };
  }

  function createTexture(gl, opts){
    opts = opts || {};
    const width = opts.width, height = opts.height;
    const data = opts.data || null;
    const format = opts.format || gl.RGBA;
    const internalFormat = opts.internalFormat || gl.RGBA8;
    const type = opts.type || gl.UNSIGNED_BYTE;
    const filter = opts.filter || gl.LINEAR;
    const wrap = opts.wrap || gl.CLAMP_TO_EDGE;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    if(width && height){
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, data);
    }
    return tex;
  }

  function uploadCanvasTexture(gl, tex, canvas, opts){
    opts = opts || {};
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    if(opts.mipmap){
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    return tex;
  }

  function createFBO(gl, width, height, opts){
    opts = opts || {};
    const tex = createTexture(gl, { width: width, height: height, type: opts.type || gl.UNSIGNED_BYTE, internalFormat: opts.internalFormat || gl.RGBA8, format: opts.format || gl.RGBA });
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE){
      throw new Error('FBO incomplete');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fbo: fbo, tex: tex, width: width, height: height };
  }

  function setUniforms(gl, prog, uniforms){
    for(const name in uniforms){
      if(name === '__unit') continue;
      const value = uniforms[name];
      const loc = gl.getUniformLocation(prog, name);
      if(loc === null) continue;
      if(typeof value === 'number'){ gl.uniform1f(loc, value); continue; }
      if(typeof value === 'boolean'){ gl.uniform1i(loc, value ? 1 : 0); continue; }
      if(value instanceof WebGLTexture){
        const unit = uniforms.__unit || 0;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, value);
        gl.uniform1i(loc, unit);
        uniforms.__unit = unit + 1;
        continue;
      }
      if(Array.isArray(value)){
        if(value.length === 2) gl.uniform2fv(loc, value);
        else if(value.length === 3) gl.uniform3fv(loc, value);
        else if(value.length === 4) gl.uniform4fv(loc, value);
        else gl.uniform1fv(loc, value);
      }
    }
  }

  function bindTextures(gl, prog, textures){
    let unit = 0;
    for(const name in textures){
      const tex = textures[name];
      const loc = gl.getUniformLocation(prog, name);
      if(loc === null) continue;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(loc, unit);
      unit++;
    }
  }

  function resizeCanvasToDisplaySize(canvas, dpr){
    dpr = dpr || window.devicePixelRatio;
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if(canvas.width !== w || canvas.height !== h){
      canvas.width = w;
      canvas.height = h;
      return true;
    }
    return false;
  }

  window.PT = Object.assign(window.PT || {}, {
    FULLSCREEN_VS: FULLSCREEN_VS,
    createGL: createGL,
    compileShader: compileShader,
    createProgram: createProgram,
    createFullscreenQuad: createFullscreenQuad,
    createTexture: createTexture,
    uploadCanvasTexture: uploadCanvasTexture,
    createFBO: createFBO,
    setUniforms: setUniforms,
    bindTextures: bindTextures,
    resizeCanvasToDisplaySize: resizeCanvasToDisplaySize,
  });
})();
