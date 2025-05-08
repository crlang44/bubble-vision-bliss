
import React from 'react';
import ImageSelector from './ImageSelector';
import { OceanImage } from '../data/oceanImages';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Images } from 'lucide-react';

interface TabletSidebarProps {
  images: OceanImage[];
  onSelectImage: (image: OceanImage) => void;
  selectedImageId: string | null;
}

const TabletSidebar: React.FC<TabletSidebarProps> = ({
  images,
  onSelectImage,
  selectedImageId
}) => {
  return (
    <div className="flex h-full">
      <Sidebar side="left" collapsible="offcanvas">
        <SidebarHeader className="flex items-center py-4">
          <div className="flex items-center gap-2">
            <Images className="h-5 w-5 text-ocean-medium" />
            <h3 className="font-semibold text-sm">Images to annotate</h3>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Select an image</SidebarGroupLabel>
            <div className="px-2">
              <ImageSelector 
                images={images} 
                onSelectImage={onSelectImage} 
                selectedImageId={selectedImageId} 
                inSidebar={true}
              />
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
};

export default TabletSidebar;
