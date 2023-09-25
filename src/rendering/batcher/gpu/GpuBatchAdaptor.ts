import { ExtensionType } from '../../../extensions/Extensions';
import { compileHighShaderGpuProgram } from '../../high-shader/compileHighShaderToProgram';
import { colorBit } from '../../high-shader/shader-bits/colorBit';
import { generateTextureBatchBit } from '../../high-shader/shader-bits/generateTextureBatchBit';
import { Shader } from '../../renderers/shared/shader/Shader';
import { State } from '../../renderers/shared/state/State';
import { MAX_TEXTURES } from '../shared/const';
import { getTextureBatchBindGroup } from './getTextureBatchBindGroup';

import type { GpuEncoderSystem } from '../../renderers/gpu/GpuEncoderSystem';
import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { Batch } from '../shared/Batcher';
import type { BatcherAdaptor, BatcherPipe } from '../shared/BatcherPipe';

const tempState = State.for2d();

export class GpuBatchAdaptor implements BatcherAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipesAdaptor,
        ],
        name: 'batch',
    } as const;

    private _shader: Shader;

    public init()
    {
        const gpuProgram = compileHighShaderGpuProgram({
            name: 'batch',
            bits: [
                colorBit,
                generateTextureBatchBit(MAX_TEXTURES),
            ]
        });

        this._shader = new Shader({
            gpuProgram,
            groups: {
                // these will be dynamically allocated
            },
        });
    }

    public start(batchPipe: BatcherPipe, geometry: Geometry): void
    {
        const renderer = batchPipe.renderer as WebGPURenderer;
        const encoder = renderer.encoder as GpuEncoderSystem;
        const program = this._shader.gpuProgram;

        encoder.setGeometry(geometry);

        tempState.blendMode = 'normal';

        // this just initates the pipeline, so we can then set bind groups on it
        renderer.pipeline.getPipeline(
            geometry,
            program,
            tempState
        );

        const globalUniformsBindGroup = renderer.globalUniforms.bindGroup;

        encoder.setBindGroup(0, globalUniformsBindGroup, program);
    }

    public execute(batchPipe: BatcherPipe, batch: Batch): void
    {
        const program = this._shader.gpuProgram;
        const renderer = batchPipe.renderer as WebGPURenderer;
        const encoder = renderer.encoder as GpuEncoderSystem;

        if (!batch.bindGroup)
        {
            const textureBatch = batch.textures;

            batch.bindGroup = getTextureBatchBindGroup(textureBatch.textures, textureBatch.count);
        }

        const gpuBindGroup = renderer.bindGroup.getBindGroup(
            batch.bindGroup, program, 1
        );

        const pipeline = renderer.pipeline.getPipeline(
            batch.batcher.geometry,
            program,
            tempState
        );

        batch.bindGroup.touch(renderer.textureGC.count);

        encoder.setPipeline(pipeline);

        encoder.renderPassEncoder.setBindGroup(1, gpuBindGroup);
        encoder.renderPassEncoder.drawIndexed(batch.size, 1, batch.start);
    }

    public destroy(): void
    {
        this._shader.destroy(true);
        this._shader = null;
    }
}
