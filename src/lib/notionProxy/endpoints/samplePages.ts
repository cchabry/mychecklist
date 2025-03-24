
import { notionApi } from '@/lib/notionProxy';
import { Project, SamplePage } from '@/lib/types';
import { mockData } from '@/lib/mockData';
import { operationMode, operationModeUtils } from '@/services/operationMode';

// Add this helper at the top of the file
const addTimestamps = (obj: any) => {
  const now = new Date().toISOString();
  return {
    ...obj,
    createdAt: obj.createdAt || now,
    updatedAt: obj.updatedAt || now
  };
};

/**
 * Sample Pages Endpoints
 */
export const samplePagesEndpoints = {
  /**
   * Get all sample pages for a project
   * @param projectId Project ID
   * @returns Sample pages
   */
  getSamplePages: async (projectId: string): Promise<SamplePage[]> => {
    try {
      // Use operationMode to determine which data source to use
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
        
        if (operationModeUtils.shouldSimulateError()) {
          throw new Error("Simulated network error");
        }
        
        // Get sample pages using mockData
        const pages = mockData.getProjectPages(projectId);
        return pages.map(page => addTimestamps(page));
      }
      
      // If in real mode, use the Notion API
      // This would be implemented with the actual Notion API integration
      throw new Error("Real mode API not implemented");
    } catch (error: any) {
      console.error("Error fetching sample pages:", error);
      throw error;
    }
  },

  /**
   * Get a sample page by ID
   * @param id Sample page ID
   * @returns Sample page
   */
  getSamplePage: async (id: string): Promise<SamplePage> => {
    try {
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
        
        if (operationModeUtils.shouldSimulateError()) {
          throw new Error("Simulated network error");
        }
        
        // Get sample page using mockData
        const page = mockData.getPage(id);
        return addTimestamps(page);
      }
      
      // Real mode implementation would go here
      throw new Error("Real mode API not implemented");
    } catch (error: any) {
      console.error("Error fetching sample page:", error);
      throw error;
    }
  },

  /**
   * Create a sample page
   * @param data Sample page data
   * @returns Sample page
   */
  createSamplePage: async (data: Omit<SamplePage, 'id' | 'createdAt' | 'updatedAt'>): Promise<SamplePage> => {
    try {
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
        
        if (operationModeUtils.shouldSimulateError()) {
          throw new Error("Simulated network error");
        }
        
        // Create sample page using mockData
        const newPage = mockData.createSamplePage(data);
        return addTimestamps(newPage);
      }
      
      // Real mode implementation would go here
      throw new Error("Real mode API not implemented");
    } catch (error: any) {
      console.error("Error creating sample page:", error);
      throw error;
    }
  },

  /**
   * Update a sample page
   * @param id Sample page ID
   * @param data Sample page data
   * @returns Sample page
   */
  updateSamplePage: async (id: string, data: Partial<SamplePage>): Promise<SamplePage> => {
    try {
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
        
        if (operationModeUtils.shouldSimulateError()) {
          throw new Error("Simulated network error");
        }
        
        // Update sample page using mockData
        const updatedPage = mockData.updateSamplePage(id, data);
        return addTimestamps(updatedPage);
      }
      
      // Real mode implementation would go here
      throw new Error("Real mode API not implemented");
    } catch (error: any) {
      console.error("Error updating sample page:", error);
      throw error;
    }
  },

  /**
   * Delete a sample page
   * @param id Sample page ID
   * @returns Success status
   */
  deleteSamplePage: async (id: string): Promise<{ success: boolean }> => {
    try {
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
        
        if (operationModeUtils.shouldSimulateError()) {
          throw new Error("Simulated network error");
        }
        
        // Delete sample page using mockData
        const result = mockData.deleteSamplePage(id);
        return result;
      }
      
      // Real mode implementation would go here
      throw new Error("Real mode API not implemented");
    } catch (error: any) {
      console.error("Error deleting sample page:", error);
      return { success: false };
    }
  },

  /**
   * Create multiple sample pages
   * @param pages Sample page data array
   * @returns Sample pages
   */
  createSamplePages: async (pages: Omit<SamplePage, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<SamplePage[]> => {
    try {
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
        
        if (operationModeUtils.shouldSimulateError()) {
          throw new Error("Simulated network error");
        }
        
        // Create multiple sample pages using mockData
        const newPages = await Promise.all(pages.map(page => mockData.createSamplePage(page)));
        return newPages.map(page => addTimestamps(page));
      }
      
      // Real mode implementation would go here
      throw new Error("Real mode API not implemented");
    } catch (error: any) {
      console.error("Error creating sample pages:", error);
      throw error;
    }
  },

  /**
   * Update multiple sample pages
   * @param pages Sample page data array
   * @returns Sample pages
   */
  updateSamplePages: async (pages: SamplePage[]): Promise<SamplePage[]> => {
    try {
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
        
        if (operationModeUtils.shouldSimulateError()) {
          throw new Error("Simulated network error");
        }
        
        // Update multiple sample pages using mockData
        const updatedPages = await Promise.all(pages.map(page => mockData.updateSamplePage(page.id, page)));
        return updatedPages.map(page => addTimestamps(page));
      }
      
      // Real mode implementation would go here
      throw new Error("Real mode API not implemented");
    } catch (error: any) {
      console.error("Error updating sample pages:", error);
      throw error;
    }
  },

  /**
   * Delete multiple sample pages
   * @param ids Sample page ID array
   * @returns Success status
   */
  deleteSamplePages: async (ids: string[]): Promise<{ success: boolean }> => {
    try {
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
        
        if (operationModeUtils.shouldSimulateError()) {
          throw new Error("Simulated network error");
        }
        
        // Delete multiple sample pages using mockData
        await Promise.all(ids.map(id => mockData.deleteSamplePage(id)));
        return { success: true };
      }
      
      // Real mode implementation would go here
      throw new Error("Real mode API not implemented");
    } catch (error: any) {
      console.error("Error deleting sample pages:", error);
      return { success: false };
    }
  },

  /**
   * Get project from sample page ID
   * @param pageId Sample page ID
   * @returns Project
   */
  getProjectFromSamplePageId: async (pageId: string): Promise<Project | null> => {
    try {
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
        
        if (operationModeUtils.shouldSimulateError()) {
          throw new Error("Simulated network error");
        }
        
        // Get sample page using mockData
        const page = mockData.getPage(pageId);
        if (!page) return null;

        // Ensure the page has timestamps
        const timestampedPage = addTimestamps(page);

        // Now you can safely access projectId
        const project = mockData.getProject(timestampedPage.projectId);
        return project || null;
      }
      
      // Real mode implementation would go here
      throw new Error("Real mode API not implemented");
    } catch (error: any) {
      console.error("Error getting project from sample page ID:", error);
      return null;
    }
  }
};
