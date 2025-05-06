/**
 * Application routes configuration
 */
export const routes = {
    home: '/',
    groundTruthEditor: '/ground-truth-editor',
    quickIdGame: '/quick-id-game'
  };
  
  /**
   * Application route labels
   */
  export const routeLabels = {
    [routes.home]: 'Ocean Annotation',
    [routes.groundTruthEditor]: 'Ground Truth Editor',
    [routes.quickIdGame]: 'Quick ID Game'
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