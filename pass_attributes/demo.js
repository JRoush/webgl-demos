function pass_attributes(canvas) {
    // Create an OpenGL context for our Canvas element.
    var gl = canvas.getContext("webgl");

    // Define and compile our vertex shader
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, `
        // A basic vertex shader that takes a 3D coordinate pair and RGB color
        // as input and returns the corresponding vertex with w=1 and unchanged 
        // color
        attribute vec3 coord;
        attribute vec3 vColor;
        varying vec3 fColor;
        void main(void) {
            fColor = vColor;
            gl_Position = vec4(coord, 1.0);
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
    
    // Allocate an array buffer for vertex positions and colors.
    // Note that we pack the coordinates and RGB data together for each vertex -
    // we could use separate arrays but this makes for less boilerplate.
    var vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    var vertData = [
         0.0,  0.5, 0.0,    1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0,    0.0, 1.0, 0.0,
         0.5, -0.5, 0.0,    0.0, 0.0, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertData), gl.STATIC_DRAW);
    
    // Use our coordinate buffer as the input to our vertex shader.
    // Note that we specify a stride and offset (in bytes) so that the hardware
    // can separate the coordinate data from the color data.
    var coordIn = gl.getAttribLocation(shaderProgram, "coord");
    gl.enableVertexAttribArray(coordIn);
    gl.vertexAttribPointer(coordIn, 3, gl.FLOAT, false, 24, 0);
    var colorIn = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(colorIn);
    gl.vertexAttribPointer(colorIn, 3, gl.FLOAT, false, 24, 12);

    // Clear the framebuffer and draw the triangle.
    gl.clearColor(0.42, 0, 0.20, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}