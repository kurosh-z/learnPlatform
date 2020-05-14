import React from 'react'
import TContentHeader from '../courseComps/TContentHeader'

const ExHeader: React.FC<{ className: string }> = ({ className }) => {
    return (
        <TContentHeader
            className={className}
            title_number="1.1"
            title="Introduction "
        >
            <TContentHeader.Objective>
                Understanding the <em>Span</em>
            </TContentHeader.Objective>
            <TContentHeader.Objective>
                Understanding the <em>Basis</em> of a Matrix
            </TContentHeader.Objective>
        </TContentHeader>
    )
}

export default ExHeader
