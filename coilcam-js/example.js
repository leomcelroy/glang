export const example = {
    "nodes": {
        "e645014a-3ebb-4003-9b62-b40dc64fa2c1": {
            "data": {
                "master": {
                    "name": "toolpath",
                    "inputs": [
                        [
                            "radius",
                            "number"
                        ],
                        [
                            "scale",
                            "number"
                        ],
                        [
                            "translate",
                            "number"
                        ],
                        [
                            "rotate",
                            "number"
                        ]
                    ],
                    "outputs": [
                        [
                            "toolpath",
                            "number[]"
                        ]
                    ]
                },
                "outputValues": [
                    0
                ]
            },
            "inputs": [
                null,
                null,
                null,
                null
            ],
            "outputs": [
                [
                    "91cbbaf7-60d4-4c4f-828f-59407ac23e0c",
                    "ea818a2e-226e-4978-b8b5-a8e91a77a008"
                ]
            ],
            "id": "e645014a-3ebb-4003-9b62-b40dc64fa2c1"
        },
        "2a4da5cc-a815-43f2-bb68-51d5b0e76470": {
            "data": {
                "master": {
                    "name": "sine",
                    "inputs": [
                        [
                            "amplitude",
                            "number"
                        ],
                        [
                            "frequency",
                            "number"
                        ],
                        [
                            "offset",
                            "number"
                        ],
                        [
                            "nbLayers",
                            "number"
                        ],
                        [
                            "values0",
                            "number"
                        ],
                        [
                            "mode",
                            "'additive' | 'multiplicative'"
                        ]
                    ],
                    "outputs": [
                        [
                            "out",
                            "number[]"
                        ],
                        [
                            "values",
                            "number[]"
                        ]
                    ]
                },
                "outputValues": [
                    0,
                    0
                ]
            },
            "inputs": [
                "cde09d23-3135-4df0-98c4-0720f151378e",
                null,
                null,
                null,
                null,
                "1c0b485d-628b-4c61-8438-5a5cce80333c"
            ],
            "outputs": [
                [],
                []
            ],
            "id": "2a4da5cc-a815-43f2-bb68-51d5b0e76470"
        },
        "0d8a66e8-4e92-40cb-8044-381da39ffd03": {
            "data": {
                "master": {
                    "name": "square",
                    "inputs": [
                        [
                            "amplitude",
                            "number"
                        ],
                        [
                            "frequency",
                            "number"
                        ],
                        [
                            "offset",
                            "number"
                        ],
                        [
                            "nbLayers",
                            "number"
                        ],
                        [
                            "values0",
                            "number"
                        ],
                        [
                            "mode",
                            "'additive' | 'multiplicative'"
                        ]
                    ],
                    "outputs": [
                        [
                            "out",
                            "number[]"
                        ],
                        [
                            "values",
                            "number[]"
                        ]
                    ]
                },
                "outputValues": [
                    0,
                    0
                ]
            },
            "inputs": [
                "5c906c5b-e9bc-4dcf-ad1e-804220fce521",
                null,
                null,
                null,
                null,
                null
            ],
            "outputs": [
                [
                    "1c0b485d-628b-4c61-8438-5a5cce80333c"
                ],
                []
            ],
            "id": "0d8a66e8-4e92-40cb-8044-381da39ffd03"
        },
        "a163908b-15f8-4e0a-9528-4276592eb11f": {
            "data": {
                "master": {
                    "name": "sine",
                    "inputs": [
                        [
                            "amplitude",
                            "number"
                        ],
                        [
                            "frequency",
                            "number"
                        ],
                        [
                            "offset",
                            "number"
                        ],
                        [
                            "nbLayers",
                            "number"
                        ],
                        [
                            "values0",
                            "number"
                        ],
                        [
                            "mode",
                            "'additive' | 'multiplicative'"
                        ]
                    ],
                    "outputs": [
                        [
                            "out",
                            "number[]"
                        ],
                        [
                            "values",
                            "number[]"
                        ]
                    ]
                },
                "outputValues": [
                    0,
                    0
                ]
            },
            "inputs": [
                "91cbbaf7-60d4-4c4f-828f-59407ac23e0c",
                null,
                null,
                null,
                null,
                null
            ],
            "outputs": [
                [
                    "12361e84-9f3b-4d5f-8a77-07148fee88cd"
                ],
                [
                    "cde09d23-3135-4df0-98c4-0720f151378e"
                ]
            ],
            "id": "a163908b-15f8-4e0a-9528-4276592eb11f"
        },
        "b6374a39-8dfd-43cc-8858-b631f1b299a8": {
            "data": {
                "master": {
                    "name": "linear",
                    "inputs": [
                        [
                            "amplitude",
                            "number"
                        ],
                        [
                            "frequency",
                            "number"
                        ],
                        [
                            "offset",
                            "number"
                        ],
                        [
                            "nbLayers",
                            "number"
                        ],
                        [
                            "values0",
                            "number"
                        ],
                        [
                            "mode",
                            "'additive' | 'multiplicative'"
                        ]
                    ],
                    "outputs": [
                        [
                            "out",
                            "number[]"
                        ],
                        [
                            "values",
                            "number[]"
                        ]
                    ]
                },
                "outputValues": [
                    0,
                    0
                ]
            },
            "inputs": [
                "ea818a2e-226e-4978-b8b5-a8e91a77a008",
                null,
                null,
                null,
                "12361e84-9f3b-4d5f-8a77-07148fee88cd",
                null
            ],
            "outputs": [
                [
                    "5c906c5b-e9bc-4dcf-ad1e-804220fce521"
                ],
                []
            ],
            "id": "b6374a39-8dfd-43cc-8858-b631f1b299a8"
        }
    },
    "edges": {
        "91cbbaf7-60d4-4c4f-828f-59407ac23e0c": {
            "data": {},
            "src": {
                "node_id": "e645014a-3ebb-4003-9b62-b40dc64fa2c1",
                "idx": 0
            },
            "dst": {
                "node_id": "a163908b-15f8-4e0a-9528-4276592eb11f",
                "idx": 0
            },
            "id": "91cbbaf7-60d4-4c4f-828f-59407ac23e0c"
        },
        "ea818a2e-226e-4978-b8b5-a8e91a77a008": {
            "data": {},
            "src": {
                "node_id": "e645014a-3ebb-4003-9b62-b40dc64fa2c1",
                "idx": 0
            },
            "dst": {
                "node_id": "b6374a39-8dfd-43cc-8858-b631f1b299a8",
                "idx": 0
            },
            "id": "ea818a2e-226e-4978-b8b5-a8e91a77a008"
        },
        "12361e84-9f3b-4d5f-8a77-07148fee88cd": {
            "data": {},
            "src": {
                "node_id": "a163908b-15f8-4e0a-9528-4276592eb11f",
                "idx": 0
            },
            "dst": {
                "node_id": "b6374a39-8dfd-43cc-8858-b631f1b299a8",
                "idx": 4
            },
            "id": "12361e84-9f3b-4d5f-8a77-07148fee88cd"
        },
        "5c906c5b-e9bc-4dcf-ad1e-804220fce521": {
            "data": {},
            "src": {
                "node_id": "b6374a39-8dfd-43cc-8858-b631f1b299a8",
                "idx": 0
            },
            "dst": {
                "node_id": "0d8a66e8-4e92-40cb-8044-381da39ffd03",
                "idx": 0
            },
            "id": "5c906c5b-e9bc-4dcf-ad1e-804220fce521"
        },
        "1c0b485d-628b-4c61-8438-5a5cce80333c": {
            "data": {},
            "src": {
                "node_id": "0d8a66e8-4e92-40cb-8044-381da39ffd03",
                "idx": 0
            },
            "dst": {
                "node_id": "2a4da5cc-a815-43f2-bb68-51d5b0e76470",
                "idx": 5
            },
            "id": "1c0b485d-628b-4c61-8438-5a5cce80333c"
        },
        "cde09d23-3135-4df0-98c4-0720f151378e": {
            "data": {},
            "src": {
                "node_id": "a163908b-15f8-4e0a-9528-4276592eb11f",
                "idx": 1
            },
            "dst": {
                "node_id": "2a4da5cc-a815-43f2-bb68-51d5b0e76470",
                "idx": 0
            },
            "id": "cde09d23-3135-4df0-98c4-0720f151378e"
        }
    }
}