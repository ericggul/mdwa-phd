//llm tab instruction: IF SLIDE COUNT IS N, THE SLIDES ON THE ARRAY SHOULD BE N-1 STRICTLY 

export const STRUCTURE = [
    {
        id: 0,
        section: 'Relevance to Design',
        components: [
            {
                id: '0-0',
                title: 'Relevance to Design',
                slideCount: 4,
                slides: [
                    { image: 'Relevance to Design 1.png', title: 'Art vs. Design' },
                    { image: 'Relevance to Design 2.png', title: 'Interactive Art: Art + Design' },
                    { image: 'Relevance to Design 3.png', title: 'Existing as artworks, Designed in practice, Engineered in implementation.' },
                ]
            }
        ]
    },
    {
        id: 1,
        section: 'Current Gap',
        components: [
            {
                id: '1-0',
                title: 'Systems Art',
                slideCount: 4,
                slides: [
                    { image: 'Systems Art 1.png', title: 'Why Systems Art?' },
                    { image: 'Systems Art 2.png', title: 'References' },
                    { image: 'Systems Art 3.png', title: 'Limitations' }
                ]
            },
            {
                id: '1-1',
                title: 'Interactive Art',
                slideCount: 5,
                slides: [
                    { image: 'Interactive Art 1.png', title: 'Why Computational Interactive Art?' },
                    { image: 'Interactive Art 2.png', title: 'References' },
                    { image: 'Interactive Art 3.png', title: 'Limitations' },
                    { image: 'Interactive Art 4.png', title: 'Limitations' }
                ]
            },
            {
                id: '1-2',
                title: 'Multi-Device Art',
                slideCount: 5,
                slides: [
                    { image: 'Multi-Device Art 1.png', title: 'Why Multi-Device Art?' },
                    { image: 'Multi-Device Art 2.png', title: 'References' },
                    { image: 'Multi-Device Art 3.png', title: 'Analysis of References' },
                    { image: 'Multi-Device Art 4.png', title: 'Limitations' }
                ]
            }
        ]
    },
    {
        id: 2,
        section: 'MDWA',
        components: [
            {
                id: '2-0',
                title: 'MDWA',
                slideCount: 6,
                slides: [
                    { image: 'MDWA 1.png', title: 'Defining MDWA' },
                    { image: 'MDWA 2.png', title: 'Jeanyoon\'s Works' },
                    { video: '/vids/Omega.mp4', title: 'Sample MDWA: Omega (2025)' },
                    { image: 'MDWA 3.png', title: 'Three Key Concepts' },
                    { image: 'MDWA 4.png', title: 'Three Frameworks' }
                ]
            }
        ]
    },
    {
        id: 3,
        section: 'Framework Design',
        components: [
            {
                id: '3-0',
                title: 'Interactive Taxonomy',
                slideCount: 4,
                slides: [
                    { image: 'Interactive Taxonomy 1.png', title: 'Cross-Device Taxonomy' },
                    { image: 'Interactive Taxonomy 2.png', title: 'Related Works' },
                    { image: 'Interactive Taxonomy 3.png', title: 'Semantic-Phenomenological Spectrum (Conceptual)' }
                ]
            },
            {
                id: '3-1',
                title: 'State-based Architecture',
                slideCount: 7,
                slides: [
                    { image: 'SbA 1.png', title: 'Key Objective' },
                    { image: 'SbA 2.png', title: 'Current Interactive Art' },
                    { image: 'SbA 3.png', title: 'Presenting SbA' },
                    { image: 'SbA 4.png', title: 'Simple SbA' },
                    { image: 'SbA 5.png', title: 'SbA + System Dynamics' },
                    { image: 'SbA 6.png', title: 'What is/is not SbA?' }
                ]
            },
            {
                id: '3-2',
                title: 'Dimensional Transformation',
                slideCount: 8,
                slides: [
                    { image: 'DT 1.png', title: 'Key Objective' },
                    { image: 'DT 2.png', title: 'Presenting DT' },
                    { image: 'DT 3.png', title: 'Simple DT' },
                    { image: 'DT 4.png', title: 'Multi-Device DT' },
                    { image: 'DT 5.png', title: 'DT with Feedback Loop' },
                    { image: 'DT 6.png', title: 'Complex SbA + DT with multiple systems' },
                    { image: 'DT 7.png', title: 'SbA + DT benefits' },
                ]
            }
        ]
    },
    {
        id: 4,
        section: 'Methodology',
        components:  [
            {
                id: '4-0',
                title: 'Research through Exhibition',
                slideCount: 4,
                slides: [
                    { image: 'RtE 1.png', title: 'What is RtE?' },
                    { image: 'RtE 2.png', title: 'PbR vs. RtD vs. RtE' },
                    { image: 'RtE 3.png', title: 'Building RtD vs. RtE' }
                ]
            }
        ]
    },
    {
        id: 5,
        section: 'Case Study',
        components: [
            {
                id: '5-0',
                title: 'Case Study 1: SoTA',
                slideCount: 8,
                slides: [
                    { image: 'Case Study 1-1.png', title: 'Presenting SoTA' },
                    { video: '/vids/SoTA.mp4', title: 'SoTA-Video' },
                    { image: 'Case Study 1-2.png', title: 'Artistic Metaphor' },
                    { image: 'Case Study 1-3.png', title: 'Neural Network Visualisation' },
                    { image: 'Case Study 1-4.png', title: 'Multi-Device Interaction' },
                    { image: 'Case Study 1-5.png', title: 'SoTA User Study' },
                    { image: 'Case Study 1-6.png', title: 'Limitations of SoTA' },
                ]
            },
            {
                id: '5-1',
                title: 'Case Study 2: Ecological System',
                slideCount: 2,
                slides: [
                    { image: 'Case Study 2-1.png', title: 'WIP' },
                ]
            },
            {
                id: '5-2',
                title: 'Case Study 3: Economic System',
                slideCount: 7,
                slides: [
                    { image: 'Case Study 3-1.png', title: 'WIP' },
                    { image: 'Case Study 3-2.png', title: 'Macroeconomic SbA' },
                    { image: 'Case Study 3-3.png', title: 'Sample System Dynamics' },
                    { video: '/vids/Vid1.mp4', title: 'Sample Visual - Labour Market' },
                    { video: '/vids/Vid2.mp4', title: 'Sample Visual - Depiciting Market Economy' },
                    { video: '/vids/Vid3.mp4', title: 'Sample Visual - Depiciting Market Economy' }
                ]
            }
        ]
    },
    {
        id: 6,
        section: 'Conclusion',
        components: [
            {
                id: '6-0',
                title: 'Research Output',
                slideCount: 6,
                slides: [
                    { image: 'Research Output 1.png', title: '3X3 Grid Research Outcome' },
                    { image: 'Research Output 2.png', title: 'Case studies bridging the gaps' },
                    { image: 'Research Output 3.png', title: 'Case studies contributing to the framework' },
                    { image: 'Research Output 4.png', title: 'Knowledge - Artwork Reinforcement Loop' },
                    { image: 'Research Output 5.png', title: 'Key Questions & Concerns' },
                ]
            }
        ]
    }
]