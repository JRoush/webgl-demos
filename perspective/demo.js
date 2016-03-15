function perspective(canvas) {
    // Create an OpenGL context for our Canvas element.
    var gl = canvas.getContext("webgl");

    // Define and compile our vertex shader
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, `
        // A vertex shader which applies a perspective transformation
        attribute vec3 coord;
        attribute vec3 vColor;
        uniform mat4 projMatrix;
        uniform mat4 rotMatrix;
        varying vec3 fColor;
        void main(void) {
            fColor = vColor;
            gl_Position = projMatrix * rotMatrix * vec4(coord, 1.0);
        }
    `);
    gl.compileShader(vertShader);

    // Define and compile our fragment shader
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, `
        // A basic fragment shader that passes on the input color with alpha 1.0
        precision mediump float;
        varying vec3 fColor;
        void main(void) {
            gl_FragColor = vec4(fColor, 1.0);
        }
    `);
    gl.compileShader(fragShader);

    // Link the shaders together
    var shaderProgram = gl.createProgram(vertShader, fragShader);
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
    
    // Allocate an array buffer for our vertex data
    var coordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
    var coords = [
         0.0,  0.5,  0.354,    1.0, 0.0, 0.0,
        -0.5,  0.0, -0.354,    0.0, 1.0, 0.0,
         0.5,  0.0, -0.354,    0.0, 0.0, 1.0,
         0.0, -0.5,  0.354,    1.0, 1.0, 1.0,
         0.0,  0.5,  0.354,    1.0, 0.0, 0.0,
        -0.5,  0.0, -0.354,    0.0, 1.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
    
    // Use our buffer as the input to our vertex shader.
    var coordIn = gl.getAttribLocation(shaderProgram, "coord");
    gl.enableVertexAttribArray(coordIn);
    var colorIn = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(colorIn);
    
    // Build a perspective transformation with 45 deg. FOV along the -Z axis
    // credit: utility functions drawn from glMatrix.js
    var identity = function() {
        a = new Float32Array(16);
        a[0] = 1;  a[4] = 0;  a[8] = 0;  a[12] = 0;
        a[1] = 0;  a[5] = 1;  a[9] = 0;  a[13] = 0;
        a[2] = 0;  a[6] = 0;  a[10] = 1; a[14] = 0;
        a[3] = 0;  a[7] = 0;  a[11] = 0; a[15] = 1;
        return a
    };
    var frustum = function(a, b, c, d, e, g, f) {
        var h = b - a, i = d - c, j = g - e;
        f[0] = e * 2 / h;  f[4] = 0;          f[8] = (b + a) / h;    f[12] = 0;
        f[1] = 0;          f[5] = e * 2 / i;  f[9] = (d + c) / i;    f[13] = 0;
        f[2] = 0;          f[6] = 0;          f[10] = -(g + e) / j;  f[14] = -(g * e * 2) / j;
        f[3] = 0;          f[7] = 0;          f[11] = -1;            f[15] = 0;
        return f
    };
    var perspective = function(a, b, c, d, e) {
        a = c * Math.tan(a * Math.PI / 360);
        b = a * b;
        return frustum(-b, b, -a, a, c, d, e)
    };
    var translateZ = function(a, b) {
        a[12] = a[8] * b + a[12];
        a[13] = a[9] * b + a[13];
        a[14] = a[10] * b + a[14];
        a[15] = a[11] * b + a[15];
        return a
    };
    var projection = translateZ(perspective(45, 1.0, 0.1, 100.0, identity()), -3);
    
    // Bind our projection matrix to the uniform input of our shader
    var projIn = gl.getUniformLocation(shaderProgram, "projMatrix");
    
    // Bind our rotation matrix to the uniform input of our shader
    var rotateY = function(a, b) {
        var d = Math.sin(b);
        b = Math.cos(b);
        var e = a[0], i = a[8],
            g = a[1], j = a[9],
            f = a[2], k = a[10],
            h = a[3], l = a[11];
        a[0] = e * b + i * -d;
        a[1] = g * b + j * -d;
        a[2] = f * b + k * -d;
        a[3] = h * b + l * -d;
        a[8] = e * d + i * b;
        a[9] = g * d + j * b;
        a[10] = f * d + k * b;
        a[11] = h * d + l * b;
        return a
    };
    var rotIn = gl.getUniformLocation(shaderProgram, "rotMatrix");
    var firstTime = new Date().getTime();
    
    var renderFrame = function () {
        // schedule this function to be called again in the next frame
        window.requestAnimationFrame(renderFrame);
        
        // update rotation matrix
        var timeNow = new Date().getTime();
        var elapsed = timeNow - firstTime;
        var rotation = rotateY(identity(), elapsed/1000.0);
        
        // set the inputs for our vertex shader 
        gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
        gl.vertexAttribPointer(coordIn, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(colorIn, 3, gl.FLOAT, false, 24, 12);
        gl.uniformMatrix4fv(projIn, false, projection);
        gl.uniformMatrix4fv(rotIn, false, rotation);
        
        // Clear the framebuffer and draw the tetrahedron.
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
    }
    
    // set background color and enable depth testing
    // depth testing culls out tha rear face of polygons
    gl.clearColor(0.42, 0, 0.20, 1.0);
    gl.enable(gl.DEPTH_TEST);
    renderFrame();
}