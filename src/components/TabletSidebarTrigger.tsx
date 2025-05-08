
import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useIsTablet } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const TabletSidebarTrigger: React.FC = () => {
  const isTablet = useIsTablet();
  
  if (!isTablet) return null;
  
  return (
    <div className="fixed left-3 top-3 z-30">
      <SidebarProvider defaultOpen={false}>
        <SidebarTrigger asChild>
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white/90 shadow-md hover:bg-white"
          >
            <PanelLeft className="h-4 w-4 mr-1" />
            <span className="text-xs">Images</span>
          </Button>
        </SidebarTrigger>
      </SidebarProvider>
    </div>
  );
};

export default TabletSidebarTrigger;
