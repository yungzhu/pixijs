import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';
import type { ParticleContainer } from '../shared/ParticleContainer';
import type { ParticleContainerAdaptor, ParticleContainerPipe } from '../shared/ParticleContainerPipe';

export class GlParticleContainerAdaptor implements ParticleContainerAdaptor
{
    public execute(particleContainerPop: ParticleContainerPipe, container: ParticleContainer)
    {
        const state = particleContainerPop.state;
        const renderer = particleContainerPop.renderer as WebGLRenderer;
        const shader = container.shader || particleContainerPop.defaultShader;

        shader.resources.uTexture = container.texture._source;
        shader.resources.uniforms = particleContainerPop.localUniforms;

        const gl = renderer.gl;

        const buffer = particleContainerPop.getBuffers(container);

        // now lets upload and render the buffers..
        renderer.shader.bind(shader);
        renderer.state.set(state);
        renderer.geometry.bind(buffer.geometry, shader.glProgram);

        const byteSize = buffer.geometry.indexBuffer.data.BYTES_PER_ELEMENT;
        const glType = byteSize === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;

        gl.drawElements(gl.TRIANGLES, container.particleChildren.length * 6, glType, 0);
    }
}
