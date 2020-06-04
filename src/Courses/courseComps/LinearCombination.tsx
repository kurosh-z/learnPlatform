import React, { useCallback } from 'react'
import { AVector, AnimatedVecProps, SetVector } from '../../3D-components'
import { addVectors } from '../../shared'
import { format as d3format } from 'd3-format'

type LinearCombinationProps = {
    x1: AnimatedVecProps
    x2: AnimatedVecProps
    u: AnimatedVecProps
    x1_base?: AnimatedVecProps
    x2_base?: AnimatedVecProps
    pause: boolean
    setX1Ref: React.MutableRefObject<SetVector>
    setX2Ref: React.MutableRefObject<SetVector>
    setURef: React.MutableRefObject<SetVector>
    setX1_baseRef?: React.MutableRefObject<SetVector>
    setX2_baseRef?: React.MutableRefObject<SetVector>

    // u?: Pick<VectorProps, 'color' | 'opacity' | 'thickness' | 'label_transform'>
}
const formatFn = d3format('.2f')
const LinearCombination: React.FC<LinearCombinationProps> = ({
    x1,
    x2,
    u,
    x1_base,
    x2_base,
    pause,
    setX1Ref,
    setX2Ref,
    setURef,
    setX1_baseRef,
    setX2_baseRef,
}) => {
    // it makes factor to fade in and out in the vecinity of 1 and 0
    const factorStyle = useCallback(
        ({ label_factor }) => ({
            opacity:
                Math.abs(label_factor - 0) < 0.01 ||
                Math.abs(label_factor - 1) < 0.01
                    ? 0
                    : 1,
            transition: 'opacity .3s ease-in-out',
        }),
        []
    )
    return (
        <>
            <AVector
                from={{ ...x1, visible: false }}
                label={'x_1'}
                // label2ndStylefn={factorStyle}
                factor_format={formatFn}
                labelID={'x1'}
                pause={pause}
                setSpringRef={setX1Ref}
            />
            <AVector
                from={{ ...x2, visible: false }}
                label={'x_2'}
                labelID={'x2'}
                factor_format={formatFn}
                // label2ndStylefn={factorStyle}
                pause={pause}
                setSpringRef={setX2Ref}
            />
            <AVector
                from={{ ...u, visible: false }}
                pause={pause}
                label={'u'}
                labelID={'u'}
                setSpringRef={setURef}
            />

            {x1_base && (
                <AVector
                    from={{ ...x1_base, visible: false }}
                    pause={pause}
                    setSpringRef={setX1_baseRef}
                />
            )}
            {x2_base && (
                <AVector
                    from={{ ...x2_base, visible: false }}
                    pause={pause}
                    setSpringRef={setX2_baseRef}
                />
            )}
        </>
    )
}

export default LinearCombination
