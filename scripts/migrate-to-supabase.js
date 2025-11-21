/**
 * Migration script to move localStorage data to Supabase
 * 
 * This script:
 * 1. Migrates categories, subcategories, and challenges from localStorage or seed data
 * 2. Migrates users from localStorage
 * 3. Migrates submissions from localStorage, mapping old challenge IDs to new UUIDs
 * 
 * Usage:
 * - Browser: Open browser console on admin.html and run this script
 * - Node: Run with `node scripts/migrate-to-supabase.js` (requires environment variables)
 */

import { createClient } from '@supabase/supabase-js';

// Seed categories data (from original storage.js)
const seedCategories = [
  {
    id: "burn-list",
    name: "Burn List",
    icon: "checklist-stroke",
    subcategories: [
      {
        id: "chill",
        name: "CHILL",
        challenges: [
          { id: "burn-list-chill-1", title: "Light a stick when you feel tired." },
          { id: "burn-list-chill-2", title: "Light a stick while dancing in the kitchen to Yellowman." },
          { id: "burn-list-chill-3", title: "Light a stick while entertaining a group of friends." }
        ]
      },
      {
        id: "wild",
        name: "WILD",
        challenges: [
          { id: "burn-list-wild-1", title: "Light a stick while doing something you've never done before." },
          { id: "burn-list-wild-2", title: "Light a stick while taking a risk that scares you." },
          { id: "burn-list-wild-3", title: "Light a stick while breaking a personal rule." },
          { id: "burn-list-wild-4", title: "Light a stick while being completely spontaneous." }
        ]
      },
      {
        id: "social",
        name: "SOCIAL",
        challenges: [
          { id: "burn-list-social-1", title: "Light a stick while introducing yourself to a stranger." },
          { id: "burn-list-social-2", title: "Light a stick while having a deep conversation with someone new." },
          { id: "burn-list-social-3", title: "Light a stick while attending a social event alone." },
          { id: "burn-list-social-4", title: "Light a stick while making plans with someone you haven't seen in months." }
        ]
      },
      {
        id: "chaos",
        name: "CHAOS",
        challenges: [
          { id: "burn-list-chaos-1", title: "Light a stick while doing something completely out of character." }
        ]
      }
    ]
  },
  {
    id: "tea-time",
    name: "Tea Time",
    icon: "clock-stroke",
    subcategories: [
      {
        id: "easy",
        name: "EASY",
        challenges: [
          { id: "tea-time-easy-1", title: "Schedule a date before the incense stick burns out." },
          { id: "tea-time-easy-2", title: "Unfollow someone you don't really like before the stick is done burning." },
          { id: "tea-time-easy-3", title: "Post a thirst trap before the ash hits the tray." }
        ]
      }
    ]
  },
  {
    id: "date-devil",
    name: "Date Devil",
    icon: "heart-stroke",
    subcategories: [
      {
        id: "first-date",
        name: "FIRST DATE",
        challenges: [
          { id: "date-devil-first-1", title: "Light a stick before going on a first date." },
          { id: "date-devil-first-2", title: "Light a stick while getting ready for a blind date." },
          { id: "date-devil-first-3", title: "Light a stick after a great first date." }
        ]
      },
      {
        id: "bad-date",
        name: "BAD DATE",
        challenges: [
          { id: "date-devil-bad-1", title: "Light a stick to recover from a terrible date." },
          { id: "date-devil-bad-2", title: "Light a stick while ghosting someone." },
          { id: "date-devil-bad-3", title: "Light a stick while getting ghosted." }
        ]
      }
    ]
  },
  {
    id: "delulu-zone",
    name: "Delulu Zone",
    icon: "comment-stroke",
    subcategories: [
      {
        id: "easy",
        name: "EASY",
        challenges: [
          { id: "delulu-zone-easy-1", title: "Light a stick while manifesting your dream life." },
          { id: "delulu-zone-easy-2", title: "Light a stick while writing in your manifestation journal." },
          { id: "delulu-zone-easy-3", title: "Light a stick while creating a vision board." }
        ]
      }
    ]
  },
  {
    id: "the-drop",
    name: "The Drop",
    icon: "box-stroke",
    subcategories: [
      {
        id: "single-af",
        name: "SINGLE AF",
        challenges: [
          { id: "the-drop-single-1", title: "Light a stick while embracing your single life." },
          { id: "the-drop-single-2", title: "Light a stick while deleting dating apps." },
          { id: "the-drop-single-3", title: "Light a stick while focusing on self-love." }
        ]
      },
      {
        id: "ghosted",
        name: "GHOSTED",
        challenges: [
          { id: "the-drop-ghosted-1", title: "Light a stick while processing being ghosted." },
          { id: "the-drop-ghosted-2", title: "Light a stick while moving on from someone who ghosted you." },
          { id: "the-drop-ghosted-3", title: "Light a stick while realizing your worth." },
          { id: "the-drop-ghosted-4", title: "Light a stick while deleting their number." }
        ]
      },
      {
        id: "bad-date",
        name: "BAD DATE",
        challenges: [
          { id: "the-drop-bad-1", title: "Light a stick after a disappointing date." },
          { id: "the-drop-bad-2", title: "Light a stick while analyzing what went wrong." },
          { id: "the-drop-bad-3", title: "Light a stick while deciding to try again." },
          { id: "the-drop-bad-4", title: "Light a stick while swearing off dating." }
        ]
      },
      {
        id: "sticky",
        name: "STICKY",
        challenges: [
          { id: "the-drop-sticky-1", title: "Light a stick while stuck in a situationship." }
        ]
      }
    ]
  },
  {
    id: "truth-tag",
    name: "Truth Tag",
    icon: "@-stroke",
    subcategories: [
      {
        id: "honest",
        name: "HONEST",
        challenges: [
          { id: "truth-tag-honest-1", title: "Light a stick while being completely honest with yourself." },
          { id: "truth-tag-honest-2", title: "Light a stick while admitting a hard truth." },
          { id: "truth-tag-honest-3", title: "Light a stick while facing reality." }
        ]
      }
    ]
  },
  {
    id: "smoke-story",
    name: "Smoke Story",
    icon: "wand-stroke",
    subcategories: [
      {
        id: "creative",
        name: "CREATIVE",
        challenges: [
          { id: "smoke-story-creative-1", title: "Light a stick while writing your story." },
          { id: "smoke-story-creative-2", title: "Light a stick while creating art that represents your journey." },
          { id: "smoke-story-creative-3", title: "Light a stick while sharing your story with someone." }
        ]
      }
    ]
  }
];

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = typeof window !== 'undefined' 
    ? window.import?.meta?.env?.VITE_SUPABASE_URL || localStorage.getItem('supabase_url')
    : process.env.VITE_SUPABASE_URL;
  
  const supabaseKey = typeof window !== 'undefined'
    ? window.import?.meta?.env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key')
    : process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Migrate categories, subcategories, and challenges
 */
async function migrateCategories(supabase) {
  console.log('Starting categories migration...');
  const challengeIdMapping = {}; // Map old string IDs to new UUIDs
  
  try {
    // Check if categories already exist
    const { data: existingCategories } = await supabase.from('categories').select('id, name').limit(1);
    if (existingCategories && existingCategories.length > 0) {
      console.log('Categories already exist. Skipping migration.');
      // Still need to build mapping for submissions
      const { data: allCategories } = await supabase.from('categories').select('id, name');
      const { data: allSubcategories } = await supabase.from('subcategories').select('id, category_id, name');
      const { data: allChallenges } = await supabase.from('challenges').select('id, title');
      
      // Note: This won't create the full mapping since we don't have old IDs stored
      // This is a limitation - full mapping would require storing old IDs in the database
      console.warn('Note: Cannot fully map old challenge IDs without old ID storage in database.');
      return challengeIdMapping;
    }

    // Migrate categories
    for (let categoryIndex = 0; categoryIndex < seedCategories.length; categoryIndex++) {
      const category = seedCategories[categoryIndex];
      
      // Create category
      const { data: newCategory, error: categoryError } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          icon: category.icon,
          order_index: categoryIndex
        }])
        .select()
        .single();

      if (categoryError) {
        console.error(`Error creating category ${category.name}:`, categoryError);
        continue;
      }

      console.log(`Created category: ${category.name}`);

      // Migrate subcategories
      for (let subcategoryIndex = 0; subcategoryIndex < category.subcategories.length; subcategoryIndex++) {
        const subcategory = category.subcategories[subcategoryIndex];
        
        // Create subcategory
        const { data: newSubcategory, error: subcategoryError } = await supabase
          .from('subcategories')
          .insert([{
            category_id: newCategory.id,
            name: subcategory.name,
            order_index: subcategoryIndex
          }])
          .select()
          .single();

        if (subcategoryError) {
          console.error(`Error creating subcategory ${subcategory.name}:`, subcategoryError);
          continue;
        }

        // Migrate challenges
        for (let challengeIndex = 0; challengeIndex < subcategory.challenges.length; challengeIndex++) {
          const challenge = subcategory.challenges[challengeIndex];
          
          // Create challenge
          const { data: newChallenge, error: challengeError } = await supabase
            .from('challenges')
            .insert([{
              subcategory_id: newSubcategory.id,
              title: challenge.title,
              order_index: challengeIndex
            }])
            .select()
            .single();

          if (challengeError) {
            console.error(`Error creating challenge ${challenge.title}:`, challengeError);
            continue;
          }

          // Map old ID to new UUID
          challengeIdMapping[challenge.id] = newChallenge.id;
          console.log(`  Mapped ${challenge.id} -> ${newChallenge.id}`);
        }
      }
    }

    console.log('Categories migration completed!');
    console.log('Challenge ID mapping:', challengeIdMapping);
    return challengeIdMapping;
  } catch (error) {
    console.error('Error during categories migration:', error);
    throw error;
  }
}

/**
 * Migrate users and submissions
 */
async function migrateUsersAndSubmissions(supabase, challengeIdMapping) {
  console.log('Starting users and submissions migration...');
  
  try {
    // Get users from localStorage (if running in browser)
    let users = {};
    if (typeof window !== 'undefined' && window.localStorage) {
      const usersStr = localStorage.getItem('stiiiks_users');
      if (usersStr) {
        users = JSON.parse(usersStr);
      }
    }

    if (Object.keys(users).length === 0) {
      console.log('No users found in localStorage. Nothing to migrate.');
      return;
    }

    // Migrate users and their submissions
    for (const email of Object.keys(users)) {
      const userData = users[email];
      
      // Find or create user
      let user;
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        user = existingUser;
        console.log(`User ${email} already exists`);
      } else {
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([{ email }])
          .select()
          .single();

        if (userError) {
          console.error(`Error creating user ${email}:`, userError);
          continue;
        }
        user = newUser;
        console.log(`Created user: ${email}`);
      }

      // Migrate submissions
      const submissions = userData.submissions || {};
      for (const [oldChallengeId, submissionData] of Object.entries(submissions)) {
        // Find new challenge UUID
        const newChallengeId = challengeIdMapping[oldChallengeId];
        
        if (!newChallengeId) {
          console.warn(`Could not find mapping for challenge ${oldChallengeId}. Skipping submission.`);
          continue;
        }

        // Check if submission already exists
        const { data: existingSubmission } = await supabase
          .from('submissions')
          .select('id')
          .eq('user_id', user.id)
          .eq('challenge_id', newChallengeId)
          .single();

        if (existingSubmission) {
          console.log(`  Submission for ${oldChallengeId} already exists. Skipping.`);
          continue;
        }

        // Create submission
        const { error: submissionError } = await supabase
          .from('submissions')
          .insert([{
            user_id: user.id,
            challenge_id: newChallengeId,
            url: submissionData.url,
            status: submissionData.status || 'pending',
            created_at: submissionData.timestamp || new Date().toISOString()
          }]);

        if (submissionError) {
          console.error(`Error creating submission for ${oldChallengeId}:`, submissionError);
        } else {
          console.log(`  Created submission for ${oldChallengeId}`);
        }
      }
    }

    console.log('Users and submissions migration completed!');
  } catch (error) {
    console.error('Error during users and submissions migration:', error);
    throw error;
  }
}

/**
 * Main migration function
 */
export async function migrateToSupabase() {
  console.log('Starting migration to Supabase...');
  
  try {
    const supabase = getSupabaseClient();
    
    // Step 1: Migrate categories, subcategories, and challenges
    const challengeIdMapping = await migrateCategories(supabase);
    
    // Step 2: Migrate users and submissions
    await migrateUsersAndSubmissions(supabase, challengeIdMapping);
    
    console.log('Migration completed successfully!');
    console.log('Challenge ID mapping (save this for reference):', challengeIdMapping);
    
    return challengeIdMapping;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// If running in browser, expose function to window
if (typeof window !== 'undefined') {
  window.migrateToSupabase = migrateToSupabase;
}

// If running as Node script
if (typeof require !== 'undefined' || typeof import.meta !== 'undefined') {
  migrateToSupabase().catch(console.error);
}

