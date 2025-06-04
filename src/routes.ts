/**
 * Application routes configuration
 */
export const routes = {
    home: '/ocean-annotation',
    oceanAnnotation: '/ocean-annotation',
    groundTruthEditor: '/ground-truth-editor',
    quickId: '/quick-id'
  };
  
  /**
   * Application route labels
   */
  export const routeLabels = {
    [routes.oceanAnnotation]: 'Ocean Annotation',
    [routes.groundTruthEditor]: 'Ground Truth Editor',
    [routes.quickId]: 'Quick ID'
  };
  
  /**
   * Helper function to get current route
   */
  export const getCurrentRoute = (): string => {
    return window.location.pathname;
  };
  
  /**
   * Helper function to navigate to a route
   */
  export const navigateTo = (route: string): void => {
    window.location.href = route;
  };
