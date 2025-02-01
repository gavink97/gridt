import fs from '../shaders/fragment.glsl';
import vs from '../shaders/vertex.glsl';
import type { Config } from '../utils/types.ts';
import { CSSGrid } from './grid.ts';

function noWebGL(variables: Config) {
	console.error('Unable to initialize WebGL. Your browser or machine may not support it.');

	CSSGrid(variables);
}

// make function to draw grid using open gl
export function Canvas(variables: Config) {
	const canvas = document.createElement('canvas');
	canvas.id = 'gridt';
	canvas.style.width = '100vw';
	canvas.style.height = '100vh';
	canvas.style.position = 'fixed';
	canvas.style.top = '0';

	const gl = canvas.getContext('webgl');

	if (gl === null) {
		noWebGL(variables);
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 0.0);
	//gl.enableVertexAttribArray(0);

	const shaderProgram = initShaders(gl);
	//const a_PositionIndex = 0;

	//gl.bindAttribLocation(shaderProgram, a_PositionIndex, 'aPosition');
	gl.linkProgram(shaderProgram);
	gl.useProgram(shaderProgram);

	draw(gl);

	document.body.appendChild(canvas);
}

function initShaders(gl: WebGLRenderingContext): WebGLProgram {
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vs);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(vertexShader));
		return null;
	}

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fs);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(fragmentShader));
		return null;
	}

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);

	return shaderProgram;
}

function draw(gl: WebGLRenderingContext) {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.POINTS, 0, 1);
}
