
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
    id: "ocean1",
    title: "Coral Reef",
    imagePath: "https://images.unsplash.com/photo-1518877593221-1f28583780b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    difficulty: "easy",
    targetAnnotations: [
      {
        id: "whale1",
        type: "rectangle",
        coordinates: [
          { x: 320, y: 180 },
          { x: 520, y: 280 }
        ],
        label: "Whale"
      },
      {
        id: "bubbles1",
        type: "point",
        coordinates: [{ x: 450, y: 120 }],
        label: "Bubbles"
      }
    ],
    description: "A majestic humpback whale jumping out of the water. Can you annotate the whale and the bubbles around it?"
  },
  {
    id: "ocean2",
    title: "Deep Blue",
    imagePath: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    difficulty: "medium",
    targetAnnotations: [
      {
        id: "river1",
        type: "polygon",
        coordinates: [
          { x: 300, y: 200 },
          { x: 400, y: 150 },
          { x: 500, y: 200 },
          { x: 400, y: 250 }
        ],
        label: "River"
      },
      {
        id: "mountain1",
        type: "rectangle",
        coordinates: [
          { x: 150, y: 100 },
          { x: 300, y: 300 }
        ],
        label: "Mountain"
      }
    ],
    description: "A beautiful river flowing between mountains. Can you identify and annotate the river and mountain?"
  },
  {
    id: "ocean3",
    title: "Ocean Wave",
    imagePath: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    difficulty: "hard",
    targetAnnotations: [
      {
        id: "wave1",
        type: "polygon",
        coordinates: [
          { x: 200, y: 150 },
          { x: 300, y: 100 },
          { x: 400, y: 150 },
          { x: 350, y: 250 },
          { x: 250, y: 250 }
        ],
        label: "Wave Crest"
      },
      {
        id: "foam1",
        type: "point",
        coordinates: [{ x: 350, y: 180 }],
        label: "Sea Foam"
      }
    ],
    description: "A powerful ocean wave at the beach. Try to annotate the wave crest and sea foam correctly!"
  }
];
