import { addLineNumberWithError, glEnumToString} from "./utils.ts";
import { DEFAULT_SHADER_TYPE } from './constants.ts';

export const loadShader = (
    gl: WebGLRenderingContext,
    shaderSource: string,
    shaderType: GLenum,
) => {
  const shader = gl.createShader(shaderType);

  if (!shader) {
    throw new Error('Failed to create shader');
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    const error = gl.getShaderInfoLog(shader) ?? '';
    gl.deleteShader(shader);
    throw new Error(`Failed to compile shader: ${error}\n${addLineNumberWithError(shaderSource, error)}`);
  }

  return shader;
};

export const createProgram = (
    gl: WebGLRenderingContext,
    shaders: WebGLShader[],
    attributes?: string[],
    locations?: number[],
) => {
  const program = gl.createProgram();

  if (!program) {
    throw new Error('Failed to create program');
  }

  shaders.forEach((shader) => {
    gl.attachShader(program, shader);
  });

  if (attributes) {
    attributes.forEach((attribute, index) => {
      gl.bindAttribLocation(
          program,
          locations ? locations[index] : index,
          attribute,
      );
    });
  }

  gl.linkProgram(program);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);

    throw new Error(`Error in program linking: ${error}\n${
      shaders.map((shader) => {
        const src = addLineNumberWithError(gl.getShaderSource(shader) ?? '');
        const type = gl.getShaderParameter(shader, gl.SHADER_TYPE);

        return `${glEnumToString(gl, type)}:\n${src}`
      }).join('\n')
    }`);
  }

  return program;
};

export const createShaderFromScript = (
  gl: WebGLRenderingContext,
  scriptId: string,
  shaderType?: GLenum,
) => {
  const shaderScript = document.getElementById(scriptId) as HTMLScriptElement;
  if (!shaderScript) {
    throw new Error(`*** Error: unknown script element${scriptId}`);
  }

  if (shaderType === undefined) {
    if (shaderScript.type === 'x-shader/x-vertex') {
      shaderType = gl.VERTEX_SHADER;
    } else if (shaderScript.type === 'x-shader/x-fragment') {
      shaderType = gl.FRAGMENT_SHADER;
    } else {
      throw new Error('*** Error: unknown shader type');
    }
  }

  return loadShader(gl, shaderScript.text, shaderType);
};

export const createProgramFromScripts = (
  gl: WebGLRenderingContext,
  shaderScriptIds: string[],
  attributes?: string[],
  locations?: number[],
) => {
  const shaders: WebGLShader[] = [];
  shaderScriptIds.forEach((s, i) => {
    shaders.push(
      createShaderFromScript(gl, s, gl[DEFAULT_SHADER_TYPE[i]]),
    );
  });

  return createProgram(gl, shaders, attributes, locations);
};

export const createProgramFromSources = (
  gl: WebGLRenderingContext,
  shaderSources: string[],
  attributes: string[],
  locations: number[],
) => {
  const shaders: WebGLShader[] = [];
  shaderSources.forEach((s, i) => {
    shaders.push(
      loadShader(gl, s, gl[DEFAULT_SHADER_TYPE[i]]),
    );
  });

  return createProgram(gl, shaders, attributes, locations);
};
export function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
  }
export const resizeCanvasToDisplaySize1 = (
  canvas: HTMLCanvasElement,
  multiplier: number,
) => {
  multiplier = multiplier || 1;
  const width = canvas.clientWidth * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }

  return false;
};
