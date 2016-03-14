// Create an OpenGL context for our Canvas element.
// This gets the browser/window manager to set up a framebuffer we 
// can draw in.
var canvas = document.getElementById("demo-canvas");
var gl = canvas.getContext("webgl");

// Define and compile our vertex shader
var vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, `
    // A very basic vertex shader that returns a
    // single vertex position at the origin
    void main(void) {
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
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

// Link the shaders together to form the programmable part of our
// rendering pipeline.  WebGL *requires* you to supply a shader program
// with a vertex and fragment shader before you can start rendering.
var shaderProgram = gl.createProgram(vertShader, fragShader);
gl.attachShader(shaderProgram, vertShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Clear the framebuffer and draw a single pixel.
gl.clearColor(0.42, 0, 0.20, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);