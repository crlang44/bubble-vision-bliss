import { TargetAnnotation } from "../utils/annotationUtils";

export interface OceanImage {
  id: string;
  title: string;
  imagePath: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetAnnotations: TargetAnnotation[];
  description: string;
}

export const oceanImages: OceanImage[] = [
  {
    "id": "ocean1",
    "title": "Coral Reef",
    "imagePath": "https://images.unsplash.com/photo-1518877593221-1f28583780b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    "difficulty": "easy",
    "targetAnnotations": [
      {
        "id": "u5l057b",
        "type": "rectangle",
        "coordinates": [
          {
            "x": 125.515625,
            "y": 105
          },
          {
            "x": 400.515625,
            "y": 406
          }
        ],
        "label": "Whale"
      },
      {
        "id": "k8vq55b",
        "type": "rectangle",
        "coordinates": [
          {
            "x": 431.515625,
            "y": 262
          },
          {
            "x": 651.515625,
            "y": 337
          }
        ],
        "label": "Bubbles"
      },
      {
        "id": "zyycefq",
        "type": "rectangle",
        "coordinates": [
          {
            "x": 187.515625,
            "y": 175
          },
          {
            "x": 273.515625,
            "y": 271
          }
        ],
        "label": "Bubbles"
      }
    ],
    "description": "A majestic humpback whale jumping out of the water. Can you annotate the whale and the bubbles around it?"
  },
  {
    "id": "ocean2",
    "title": "Deep Blue",
    "imagePath": "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    "difficulty": "medium",
    "targetAnnotations": [
      {
        "id": "ld85ad5",
        "type": "rectangle",
        "coordinates": [
          {
            "x": 0.515625,
            "y": 38
          },
          {
            "x": 295.515625,
            "y": 447
          }
        ],
        "label": "Mountain"
      },
      {
        "id": "ky91k7o",
        "type": "rectangle",
        "coordinates": [
          {
            "x": 40.515625,
            "y": 192
          },
          {
            "x": 196.515625,
            "y": 447
          }
        ],
        "label": "River"
      }
    ],
    "description": "A beautiful river flowing between mountains. Can you identify and annotate the river and mountain?"
  },
  {
    "id": "ocean3",
    "title": "Ocean Wave",
    "imagePath": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    "difficulty": "hard",
    "targetAnnotations": [
      {
        "id": "x3ks0v1",
        "type": "rectangle",
        "coordinates": [
          {
            "x": 43.015625,
            "y": 263
          },
          {
            "x": 179.015625,
            "y": 353
          }
        ],
        "label": "Wave Crest"
      },
      {
        "id": "luamo7z",
        "type": "rectangle",
        "coordinates": [
          {
            "x": 184.015625,
            "y": 244
          },
          {
            "x": 293.015625,
            "y": 347
          }
        ],
        "label": "Sea Foam"
      }
    ],
    "description": "A powerful ocean wave at the beach. Try to annotate the wave crest and sea foam correctly!"
  }
];