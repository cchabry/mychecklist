
import { notionApi } from '@/lib/notionProxy';
import { Project, SamplePage } from '@/lib/types';
import { mockData, consolidatedMockData } from '@/lib/mockData';

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
      // Get sample pages using mockData
      const pages = consolidatedMockData.getProjectPages(projectId);
      return pages.map(page => addTimestamps(page));
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
      // Get sample page using mockData
      const page = consolidatedMockData.getPage(id);
      return addTimestamps(page);
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
      // Create sample page using mockData
      const newPage = consolidatedMockData.createSamplePage(data);
      return addTimestamps(newPage);
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
      // Update sample page using mockData
      const updatedPage = consolidatedMockData.updateSamplePage(id, data);
      return addTimestamps(updatedPage);
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
      // Delete sample page using mockData
      const result = consolidatedMockData.deleteSamplePage(id);
      return result;
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
      // Create multiple sample pages using mockData
      const newPages = await Promise.all(pages.map(page => consolidatedMockData.createSamplePage(page)));
      return newPages.map(page => addTimestamps(page));
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
      // Update multiple sample pages using mockData
      const updatedPages = await Promise.all(pages.map(page => consolidatedMockData.updateSamplePage(page.id, page)));
      return updatedPages.map(page => addTimestamps(page));
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
      // Delete multiple sample pages using mockData
      await Promise.all(ids.map(id => consolidatedMockData.deleteSamplePage(id)));
      return { success: true };
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
      // Get sample page using mockData
      const page = consolidatedMockData.getPage(pageId);
      if (!page) return null;

      // Ensure the page has timestamps
      const timestampedPage = addTimestamps(page);

      // Now you can safely access projectId
      const project = consolidatedMockData.getProject(timestampedPage.projectId);
      return project || null;
    } catch (error: any) {
      console.error("Error getting project from sample page ID:", error);
      return null;
    }
  }
};
