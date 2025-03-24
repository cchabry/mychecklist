
import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';
import { SamplePage } from '@/lib/types';

// Pages API endpoints

/**
 * Get all sample pages
 */
export async function getAllPages() {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Return mock data
    return mockData.getPages ? mockData.getPages() : mockData.pages;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for pages');
}

/**
 * Get pages for a specific project
 * @param projectId Project ID
 */
export async function getProjectPages(projectId: string) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Return mock data
    return mockData.getProjectPages 
      ? mockData.getProjectPages(projectId) 
      : mockData.pages.filter(page => page.projectId === projectId);
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for project pages');
}

/**
 * Get a specific page by ID
 * @param pageId Page ID
 */
export async function getPage(pageId: string) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Return mock data
    return mockData.getPage 
      ? mockData.getPage(pageId) 
      : mockData.pages.find(page => page.id === pageId);
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for specific page');
}

/**
 * Create a new sample page
 * @param data Page data
 */
export async function create(data: Partial<SamplePage>) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Create a new page using mock data
    if (mockData.createSamplePage) {
      return mockData.createSamplePage(data);
    }
    
    // Fallback implementation if the mockData function isn't available
    const newPage: SamplePage = {
      id: `page_${Date.now()}`,
      projectId: data.projectId || '',
      url: data.url || '',
      title: data.title || 'New Page',
      description: data.description || '',
      order: data.order || 0,
    };
    
    return newPage;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for page creation');
}

/**
 * Update a sample page
 * @param pageId Page ID
 * @param data Update data
 */
export async function update(pageId: string, data: Partial<SamplePage>) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Update the page using mock data
    if (mockData.updateSamplePage) {
      return mockData.updateSamplePage(pageId, data);
    }
    
    // Fallback implementation if the mockData function isn't available
    const page = mockData.pages.find(p => p.id === pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }
    
    const updatedPage = {
      ...page,
      ...data,
    };
    
    return updatedPage;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for page update');
}

/**
 * Delete a sample page
 * @param pageId Page ID
 */
export async function deletePage(pageId: string) {
  // Check if we're in mock mode
  if (operationMode.isDemoMode) {
    // Apply delay to simulate network request
    await operationModeUtils.applySimulatedDelay();
    
    // Delete the page using mock data
    return mockData.deletePage 
      ? mockData.deletePage(pageId) 
      : true;
  }
  
  // In real mode, connect to Notion API
  throw new Error('Notion API not implemented for page deletion');
}
