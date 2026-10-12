import {
    metadata as maxwellMetadata,
    content as maxwellContent
} from './maxwell-equation.js'
import {
    metadata as lagrangianMetadata,
    content as lagrangianContent
} from './Lagrangian-Hamiltonian.js'
import {
    metadata as spacetimeMetadata,
    content as spacetimeContent
} from './spacetime-geometry.js'

const modules = {
    'maxwell-equation': {
        metadata: maxwellMetadata,
        content: maxwellContent
    },
    'Lag-Ham-Mech': {
        metadata: lagrangianMetadata,
        content: lagrangianContent
    },
    "spacetime-geometry": {
        metadata: spacetimeMetadata,
        content: spacetimeContent
    }
}

export const notes = [
    maxwellMetadata,
    lagrangianMetadata,
    spacetimeMetadata,
    {
        id: 'relativity',
        title: 'Relativity Notes',
        category: 'Physics',
        description: 'Special and general relativity concepts, including time dilation, length contraction, and spacetime diagrams.',
        tags: ['Physics', 'Relativity'],
        date: '2024'
    },
    {
        id: 'linear-algebra',
        title: 'Linear Algebra',
        category: 'Mathematics',
        description: 'Vector spaces, linear transformations, matrices, eigenvalues, and eigenvectors.',
        tags: ['Math', 'Linear Algebra'],
        date: '2024'
    }
]

export const categories = ['Physics', 'Mathematics']

export const notesData = {}

for (const note of notes) {
    notesData[note.id] = note
}

export function getNote(id) {
    const module = modules[id]

    if (!module) return null

    return {
        ...module.metadata,
        content: module.content
    }
}