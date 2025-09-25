import { SectionItem } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Section API functions
export const sectionApi = {
  // Insert section by project id
  async createSection(projectId: string, name: string): Promise<SectionItem> {
    const response = await fetch(`${API_BASE_URL}/sections/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        project_id: projectId
      }),
    });
    if (!response.ok) throw new Error('Failed to create section');
    return response.json();
  },

  // Check if section name is unique within the project
  async checkSectionNameExists(projectId: string, sectionName: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/sections/check_name/?project_id=${projectId}&name=${encodeURIComponent(sectionName)}`);
    if (!response.ok) throw new Error('Failed to check section name');
    const { exists } = await response.json();
    return exists;
  },

  // Get sections by project id
  async getSectionsByProject(projectId: string): Promise<SectionItem[]> {
    const response = await fetch(`${API_BASE_URL}/sections/?project_id=${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch sections');
    return response.json();
  },

  // Get inbox sections (project_id = null, current_view = inbox)
  async getInboxSections(): Promise<SectionItem[]> {
    const response = await fetch(`${API_BASE_URL}/sections/?project_id=null&current_view=inbox`);
    if (!response.ok) throw new Error('Failed to fetch inbox sections');
    return response.json();
  },

  // Create section in Inbox (project_id = null)
  async createInboxSection(name: string): Promise<SectionItem> {
    const response = await fetch(`${API_BASE_URL}/sections/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        project_id: null,
        current_view: ["inbox"]
      }),
    });
    if (!response.ok) throw new Error('Failed to create inbox section');
    return response.json();
  },

  // Check if section name exists in Inbox (project_id = null)
  async checkInboxSectionNameExists(sectionName: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/sections/check_name/?project_id=null&name=${encodeURIComponent(sectionName)}`);
    if (!response.ok) throw new Error('Failed to check inbox section name');
    const { exists } = await response.json();
    return exists;
  },

  // Delete section by section id
  async deleteSection(sectionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete section');
  },

  // Update section name
  async updateSectionName(sectionId: string, name: string): Promise<SectionItem> {
    const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update section name');
    return response.json();
  },

  // Get section by ID
  async getSectionById(sectionId: string): Promise<SectionItem> {
    const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/`);
    if (!response.ok) throw new Error('Failed to fetch section');
    return response.json();
  },

  // Get today sections (project_id = null, current_view = "today")
  async getTodaySections(): Promise<SectionItem[]> {
    const response = await fetch(`${API_BASE_URL}/sections/?project_id=null&current_view=today`);
    if (!response.ok) throw new Error('Failed to fetch today sections');
    return response.json();
  },

  // Create section for Today view (project_id = null)
  async createTodaySection(name: string): Promise<SectionItem> {
    const response = await fetch(`${API_BASE_URL}/sections/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        project_id: null,
        current_view: ["today"]
      }),
    });
    if (!response.ok) throw new Error('Failed to create today section');
    return response.json();
  },

  // Get or create "Completed" section for a project
  async getOrCreateCompletedSection(projectId: string): Promise<{section: SectionItem, created: boolean}> {
    const response = await fetch(`${API_BASE_URL}/sections/get_or_create_completed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId
      }),
    });
    if (!response.ok) throw new Error('Failed to get/create completed section');
    return response.json();
  },

  // Get or create "Completed" section for Inbox (project_id = null)
  async getOrCreateInboxCompletedSection(): Promise<{section: SectionItem, created: boolean}> {
    try {
      console.log('DEBUG: getOrCreateInboxCompletedSection - starting');

      // First, try to find an existing "Completed" section in Inbox
      console.log('DEBUG: Fetching inbox sections');
      const inboxSectionsResponse = await this.getInboxSections();
      console.log('DEBUG: Inbox sections response:', inboxSectionsResponse);

      // Extract the results array from the paginated response
      const inboxSections = inboxSectionsResponse.results || inboxSectionsResponse;
      console.log('DEBUG: Inbox sections array:', inboxSections);

      const existingCompleted = inboxSections.find(section => section.name === "Completed");
      console.log('DEBUG: Existing completed section:', existingCompleted);

      if (existingCompleted) {
        console.log('DEBUG: Found existing completed section, returning it');
        return { section: existingCompleted, created: false };
      }

      // If not found, create a new "Completed" section for Inbox
      console.log('DEBUG: No existing completed section found, creating new one');
      const newSection = await this.createInboxSection("Completed");
      console.log('DEBUG: Created new completed section:', newSection);
      return { section: newSection, created: true };
    } catch (error) {
      console.error('DEBUG: Error in getOrCreateInboxCompletedSection:', error);
      throw new Error('Failed to get/create inbox completed section');
    }
  },

  // Get upcoming sections (project_id = null, current_view = "upcoming")
  async getUpcomingSections(): Promise<SectionItem[]> {
    const response = await fetch(`${API_BASE_URL}/sections/?project_id=null&current_view=upcoming`);
    if (!response.ok) throw new Error('Failed to fetch upcoming sections');
    return response.json();
  },

  // Create section for Upcoming view (project_id = null)
  async createUpcomingSection(name: string): Promise<SectionItem> {
    const response = await fetch(`${API_BASE_URL}/sections/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        project_id: null,
        current_view: ["upcoming"]
      }),
    });
    if (!response.ok) throw new Error('Failed to create upcoming section');
    return response.json();
  },

  // Get or create "Completed" section for Today view (project_id = null, current_view = ["today"])
  async getOrCreateTodayCompletedSection(): Promise<{section: SectionItem, created: boolean}> {
    try {
      // First, try to find an existing "Completed" section in Today
      const todaySectionsResponse = await this.getTodaySections();
      const todaySections = todaySectionsResponse.results || todaySectionsResponse;

      const existingCompleted = todaySections.find(section => section.name === "Completed");

      if (existingCompleted) {
        return { section: existingCompleted, created: false };
      }

      // If not found, create a new "Completed" section for Today
      const newSection = await fetch(`${API_BASE_URL}/sections/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Completed",
          project_id: null,
          current_view: ["today"]
        }),
      });

      if (!newSection.ok) throw new Error('Failed to create today completed section');
      const createdSection = await newSection.json();
      return { section: createdSection, created: true };
    } catch (error) {
      console.error('Error in getOrCreateTodayCompletedSection:', error);
      throw new Error('Failed to get/create today completed section');
    }
  },

  // Get or create "Completed" section for Upcoming view (project_id = null, current_view = ["upcoming"])
  async getOrCreateUpcomingCompletedSection(): Promise<{section: SectionItem, created: boolean}> {
    try {
      // First, try to find an existing "Completed" section in Upcoming
      const upcomingSectionsResponse = await this.getUpcomingSections();
      const upcomingSections = upcomingSectionsResponse.results || upcomingSectionsResponse;

      const existingCompleted = upcomingSections.find(section => section.name === "Completed");

      if (existingCompleted) {
        return { section: existingCompleted, created: false };
      }

      // If not found, create a new "Completed" section for Upcoming
      const newSection = await fetch(`${API_BASE_URL}/sections/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Completed",
          project_id: null,
          current_view: ["upcoming"]
        }),
      });

      if (!newSection.ok) throw new Error('Failed to create upcoming completed section');
      const createdSection = await newSection.json();
      return { section: createdSection, created: true };
    } catch (error) {
      console.error('Error in getOrCreateUpcomingCompletedSection:', error);
      throw new Error('Failed to get/create upcoming completed section');
    }
  },
};
