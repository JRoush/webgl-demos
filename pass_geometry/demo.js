function pass_geometry(canvas) {
    // Create an OpenGL context for our Canvas element.
    var gl = canvas.getContext("webgl");

    // Define and compile our vertex shader
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, `
        // A basic vertex shader that takes a 2D coordinate pair
        // as input and returns the corresponding vertex with z=0, w=1
        attribute vec2 coord;
        void main(void) {
            gl_Position = vec4(coord, 0.0, 1.0);
        }
    `);
    gl.compileShader(vertShader);

    // Define and compile our fragment shader
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, `
        // A very basic fragment shader that returns a single color
        void main(void) {
            gl_FragColor = vec4(1.0, 0.78, 0.18, 1.0);
        }
    `);
    gl.compileShader(fragShader);

    // Link the shaders together
    var shaderProgram = gl.createProgram(vertShader, fragShader);
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
    
    // Allocate an array buffer (stored on the GPU) and write the 2D
    // coordinates for our triangle into it.
    var coordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
    var coords = [
         0.0,  0.5,
        -0.5, -0.5,
         0.5, -0.5
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
    
    // Use our coordinate buffer as the input to our vertex shader.
    var coordIn = gl.getAttribLocation(shaderProgram, "coord");
    gl.enableVertexAttribArray(coordIn);
    gl.vertexAttribPointer(coordIn, 2, gl.FLOAT, false, 0, 0);

    // Clear the framebuffer and draw the triangle.
    gl.clearColor(0.42, 0, 0.20, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}