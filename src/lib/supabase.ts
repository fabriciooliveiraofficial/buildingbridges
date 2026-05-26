// Supabase to MySQL Express API Adapter
// This file acts as a transparent bridge, replacing the Supabase client with
// a mock client that sends AJAX requests to our local Express API (/api/projects).
// This preserves the exact code and interface in ProjectsPage, HomePage, ImpactPage, and AdminPage!

class MockSupabaseClient {
  private uploadMap = new Map<string, string>();

  from(table: string) {
    if (table !== 'projects') {
      throw new Error(`Table "${table}" is not supported in the Hostinger MySQL adapter.`);
    }

    let limitVal: number | null = null;
    let eqField: string | null = null;
    let eqValue: any = null;
    let singleVal = false;

    const builder = {
      select: () => builder,
      limit: (val: number) => {
        limitVal = val;
        return builder;
      },
      eq: (field: string, value: any) => {
        eqField = field;
        eqValue = value;
        return builder;
      },
      single: () => {
        singleVal = true;
        return builder;
      },
      insert: async (dataArray: any[]) => {
        try {
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataArray[0])
          });

          if (!response.ok) {
            const errData = await response.json();
            return { data: null, error: new Error(errData.error || 'Failed to insert project') };
          }

          const resData = await response.json();
          return { data: [resData.project], error: null };
        } catch (error: any) {
          console.error('API Error in insert:', error);
          return { data: null, error };
        }
      },
      // Support Promise chaining/awaiting directly on the builder
      then: async (resolve: any, reject: any) => {
        try {
          let url = '/api/projects';
          
          if (eqField === 'id' && eqValue) {
            url = `/api/projects/${encodeURIComponent(eqValue)}`;
          } else if (limitVal) {
            url = `/api/projects?limit=${limitVal}`;
          }

          const response = await fetch(url);
          if (!response.ok) {
            const errData = await response.json();
            return resolve({ data: null, error: new Error(errData.error || 'Failed to fetch data') });
          }

          const data = await response.json();
          return resolve({ data, error: null });
        } catch (error: any) {
          console.error('API Error in select:', error);
          return resolve({ data: null, error });
        }
      }
    };

    return builder;
  }

  // Storage client mock to route image uploads to /api/upload
  storage = {
    from: (bucket: string) => {
      if (bucket !== 'media') {
        throw new Error(`Bucket "${bucket}" is not supported in this adapter. Use "media".`);
      }
      
      return {
        upload: async (filePath: string, file: File) => {
          try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              const errData = await response.json();
              return { data: null, error: new Error(errData.error || 'Failed to upload image') };
            }

            const resData = await response.json();
            // Cache the uploaded relative URL so we can return it in getPublicUrl()
            this.uploadMap.set(filePath, resData.publicUrl);
            
            return { data: { path: filePath }, error: null };
          } catch (error: any) {
            console.error('Upload error in storage mock:', error);
            return { data: null, error };
          }
        },
        getPublicUrl: (filePath: string) => {
          const publicUrl = this.uploadMap.get(filePath) || filePath;
          return {
            data: {
              publicUrl
            }
          };
        }
      };
    }
  };
}

export const supabase = new MockSupabaseClient() as any;
