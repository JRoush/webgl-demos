function animation(canvas) {
    // Create an OpenGL context for our Canvas element.
    var gl = canvas.getContext("webgl");

    // Define and compile our vertex shader
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, `
        // A basic vertex shader that takes a 2D coordinate pair
        // as input and returns the corresponding vertex with z=0, w=1
        attribute vec2 coord;
        uniform mat2 rotation;
        void main(void) {
            gl_Position = vec4(rotation * coord, 0.0, 1.0);
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
    
    // Allocate an array buffer for our vertex data.
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
    
    // Bind our rotation matrix to the uniform input of our shader
    var rotIn = gl.getUniformLocation(shaderProgram, "rotation");
    var rotation = new Float32Array(4);
    var firstTime = new Date().getTime();
    
    var renderFrame = function () {
        // schedule this function to be called again in the next frame
        window.requestAnimationFrame(renderFrame);
        
        // update rotation matrix
        var timeNow = new Date().getTime();
        var elapsed = timeNow - firstTime;
        rotation[0] = rotation[3] = Math.cos(elapsed / 1000.0);
        rotation[1] = Math.sin(elapsed / 1000.0);
        rotation[2] = -rotation[1];
        
        // set the inputs for our vertex shader 
        gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
        gl.vertexAttribPointer(coordIn, 2, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix2fv(rotIn, false, rotation);

        // Clear the framebuffer and draw the triangle.
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    
    // set the background color
    gl.clearColor(0.42, 0, 0.20, 1.0);
    renderFrame();
}