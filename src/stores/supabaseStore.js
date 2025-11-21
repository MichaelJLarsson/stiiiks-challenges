import { supabase } from '../lib/supabase.js';

// ==================== USER FUNCTIONS ====================

/**
 * Get all users with optional filtering
 */
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
}

/**
 * Find or create a user by email
 */
export async function findOrCreateUser(email) {
  // First, try to find the user
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // User doesn't exist, create it
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([{ email }])
    .select()
    .single();

  if (createError) {
    console.error('Error creating user:', createError);
    throw createError;
  }

  return newUser;
}

// ==================== CATEGORY/CHALLENGE FUNCTIONS ====================

/**
 * Get all categories with subcategories and challenges (joined query)
 */
export async function getCategories() {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true });

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    throw categoriesError;
  }

  if (!categories || categories.length === 0) {
    return [];
  }

  // Get all subcategories for these categories
  const categoryIds = categories.map((cat) => cat.id);
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('subcategories')
    .select('*')
    .in('category_id', categoryIds)
    .order('order_index', { ascending: true });

  if (subcategoriesError) {
    console.error('Error fetching subcategories:', subcategoriesError);
    throw subcategoriesError;
  }

  // Get all challenges for these subcategories
  const subcategoryIds = subcategories?.map((sub) => sub.id) || [];
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select('*')
    .in('subcategory_id', subcategoryIds)
    .order('order_index', { ascending: true });

  if (challengesError) {
    console.error('Error fetching challenges:', challengesError);
    throw challengesError;
  }

  // Build the nested structure
  const result = categories.map((category) => {
    const categorySubcategories = (subcategories || [])
      .filter((sub) => sub.category_id === category.id)
      .map((subcategory) => {
        const subcategoryChallenges = (challenges || []).filter(
          (challenge) => challenge.subcategory_id === subcategory.id
        );
        return {
          ...subcategory,
          challenges: subcategoryChallenges,
        };
      });

    return {
      ...category,
      subcategories: categorySubcategories,
    };
  });

  return result;
}

/**
 * Get a single category by ID with relations
 */
export async function getCategoryById(categoryId) {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (categoryError) {
    console.error('Error fetching category:', categoryError);
    throw categoryError;
  }

  if (!category) {
    return null;
  }

  // Get subcategories
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .order('order_index', { ascending: true });

  if (subcategoriesError) {
    console.error('Error fetching subcategories:', subcategoriesError);
    throw subcategoriesError;
  }

  // Get challenges for these subcategories
  const subcategoryIds = subcategories?.map((sub) => sub.id) || [];
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select('*')
    .in('subcategory_id', subcategoryIds)
    .order('order_index', { ascending: true });

  if (challengesError) {
    console.error('Error fetching challenges:', challengesError);
    throw challengesError;
  }

  // Build nested structure
  const categorySubcategories = (subcategories || []).map((subcategory) => {
    const subcategoryChallenges = (challenges || []).filter(
      (challenge) => challenge.subcategory_id === subcategory.id
    );
    return {
      ...subcategory,
      challenges: subcategoryChallenges,
    };
  });

  return {
    ...category,
    subcategories: categorySubcategories,
  };
}

/**
 * Create a new category
 */
export async function createCategory(categoryData) {
  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        name: categoryData.name,
        icon: categoryData.icon,
        order_index: categoryData.order_index || 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
}

/**
 * Update a category
 */
export async function updateCategory(categoryId, categoryData) {
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: categoryData.name,
      icon: categoryData.icon,
      order_index: categoryData.order_index,
      updated_at: new Date().toISOString(),
    })
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a category (cascades to subcategories and challenges)
 */
export async function deleteCategory(categoryId) {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

/**
 * Create a new subcategory
 */
export async function createSubcategory(categoryId, subcategoryData) {
  const { data, error } = await supabase
    .from('subcategories')
    .insert([
      {
        category_id: categoryId,
        name: subcategoryData.name,
        order_index: subcategoryData.order_index || 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating subcategory:', error);
    throw error;
  }

  return data;
}

/**
 * Update a subcategory
 */
export async function updateSubcategory(subcategoryId, subcategoryData) {
  const { data, error } = await supabase
    .from('subcategories')
    .update({
      name: subcategoryData.name,
      order_index: subcategoryData.order_index,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subcategoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating subcategory:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a subcategory (cascades to challenges)
 */
export async function deleteSubcategory(subcategoryId) {
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', subcategoryId);

  if (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }
}

/**
 * Create a new challenge
 */
export async function createChallenge(subcategoryId, challengeData) {
  const { data, error } = await supabase
    .from('challenges')
    .insert([
      {
        subcategory_id: subcategoryId,
        title: challengeData.title,
        order_index: challengeData.order_index || 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating challenge:', error);
    throw error;
  }

  return data;
}

/**
 * Update a challenge
 */
export async function updateChallenge(challengeId, challengeData) {
  const { data, error } = await supabase
    .from('challenges')
    .update({
      title: challengeData.title,
      order_index: challengeData.order_index,
      updated_at: new Date().toISOString(),
    })
    .eq('id', challengeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating challenge:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a challenge
 */
export async function deleteChallenge(challengeId) {
  const { error } = await supabase.from('challenges').delete().eq('id', challengeId);

  if (error) {
    console.error('Error deleting challenge:', error);
    throw error;
  }
}

/**
 * Reorder a category
 */
export async function reorderCategory(categoryId, newOrder) {
  const { data, error } = await supabase
    .from('categories')
    .update({ order_index: newOrder, updated_at: new Date().toISOString() })
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error reordering category:', error);
    throw error;
  }

  return data;
}

/**
 * Reorder a subcategory
 */
export async function reorderSubcategory(subcategoryId, newOrder) {
  const { data, error } = await supabase
    .from('subcategories')
    .update({ order_index: newOrder, updated_at: new Date().toISOString() })
    .eq('id', subcategoryId)
    .select()
    .single();

  if (error) {
    console.error('Error reordering subcategory:', error);
    throw error;
  }

  return data;
}

/**
 * Reorder a challenge
 */
export async function reorderChallenge(challengeId, newOrder) {
  const { data, error } = await supabase
    .from('challenges')
    .update({ order_index: newOrder, updated_at: new Date().toISOString() })
    .eq('id', challengeId)
    .select()
    .single();

  if (error) {
    console.error('Error reordering challenge:', error);
    throw error;
  }

  return data;
}

// ==================== SUBMISSION FUNCTIONS ====================

/**
 * Get submissions with optional filters and joins
 */
export async function getSubmissions(filters = {}) {
  let query = supabase
    .from('submissions')
    .select(
      `
      *,
      user:users!inner(email),
      challenge:challenges!inner(
        id,
        title,
        subcategory:subcategories!inner(
          id,
          name,
          category:categories!inner(id, name, icon)
        )
      )
    `
    );

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters.challenge_id) {
    query = query.eq('challenge_id', filters.challenge_id);
  }

  // Note: category_id filter is handled client-side after fetching
  // Supabase doesn't support nested filtering easily

  // Apply search - simplified to work with Supabase
  if (filters.search) {
    // Search only on URL field for now (can be expanded)
    query = query.ilike('url', `%${filters.search}%`);
  }

  // Apply sorting
  if (filters.sortBy === 'date_asc') {
    query = query.order('created_at', { ascending: true });
  } else if (filters.sortBy === 'date_desc' || !filters.sortBy) {
    query = query.order('created_at', { ascending: false });
  }
  // Note: user sorting is handled client-side after fetching

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }

  let results = data || [];

  // Apply client-side filters that couldn't be done in SQL
  if (filters.category_id) {
    results = results.filter(
      (submission) =>
        submission.challenge?.subcategory?.category?.id === filters.category_id
    );
  }

  if (filters.search) {
    // Additional search on nested fields
    const searchLower = filters.search.toLowerCase();
    results = results.filter(
      (submission) =>
        submission.url?.toLowerCase().includes(searchLower) ||
        submission.user?.email?.toLowerCase().includes(searchLower) ||
        submission.challenge?.title?.toLowerCase().includes(searchLower)
    );
  }

  // Apply user sorting if needed
  if (filters.sortBy === 'user') {
    results.sort((a, b) => {
      const emailA = a.user?.email || '';
      const emailB = b.user?.email || '';
      return emailA.localeCompare(emailB);
    });
  }

  return results;
}

/**
 * Get submissions for a specific user by email
 */
export async function getUserSubmissions(email) {
  // First find the user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !user) {
    return [];
  }

  // Get submissions with challenge info
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      *,
      challenge:challenges!inner(
        id,
        title,
        subcategory:subcategories!inner(
          id,
          name,
          category:categories!inner(id, name, icon)
        )
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user submissions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get recent submissions for dashboard
 */
export async function getRecentSubmissions(limit = 20) {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      *,
      user:users!inner(email),
      challenge:challenges!inner(
        id,
        title,
        subcategory:subcategories!inner(
          id,
          name,
          category:categories!inner(id, name, icon)
        )
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent submissions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get submission statistics
 */
export async function getSubmissionStats() {
  // Get total counts
  const { count: totalCount, error: totalError } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total submissions:', totalError);
    throw totalError;
  }

  // Get pending count
  const { count: pendingCount, error: pendingError } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (pendingError) {
    console.error('Error fetching pending submissions:', pendingError);
    throw pendingError;
  }

  // Get approved count
  const { count: approvedCount, error: approvedError } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  if (approvedError) {
    console.error('Error fetching approved submissions:', approvedError);
    throw approvedError;
  }

  // Get unique users count
  const { count: uniqueUsersCount, error: usersError } = await supabase
    .from('submissions')
    .select('user_id', { count: 'exact', head: true });

  if (usersError) {
    console.error('Error fetching unique users:', usersError);
    throw usersError;
  }

  // Get distinct user count properly
  const { data: distinctUsers, error: distinctError } = await supabase
    .from('submissions')
    .select('user_id');

  if (distinctError) {
    console.error('Error fetching distinct users:', distinctError);
    throw distinctError;
  }

  const uniqueUsers = new Set(distinctUsers?.map((s) => s.user_id) || []).size;

  return {
    total: totalCount || 0,
    pending: pendingCount || 0,
    approved: approvedCount || 0,
    uniqueUsers: uniqueUsers,
  };
}

/**
 * Submit a challenge (create or update submission)
 */
export async function submitChallenge(email, challengeId, url) {
  // Find or create user
  const user = await findOrCreateUser(email);

  // Check if submission already exists
  const { data: existingSubmission, error: findError } = await supabase
    .from('submissions')
    .select('id')
    .eq('user_id', user.id)
    .eq('challenge_id', challengeId)
    .single();

  if (existingSubmission) {
    // Update existing submission
    const { data, error } = await supabase
      .from('submissions')
      .update({
        url,
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSubmission.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating submission:', error);
      throw error;
    }

    return data;
  } else {
    // Create new submission
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          user_id: user.id,
          challenge_id: challengeId,
          url,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      throw error;
    }

    return data;
  }
}

/**
 * Approve a submission
 */
export async function approveSubmission(submissionId) {
  const { data, error } = await supabase
    .from('submissions')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    console.error('Error approving submission:', error);
    throw error;
  }

  return data;
}

/**
 * Reject a submission (delete it)
 */
export async function rejectSubmission(submissionId) {
  const { error } = await supabase.from('submissions').delete().eq('id', submissionId);

  if (error) {
    console.error('Error rejecting submission:', error);
    throw error;
  }
}

/**
 * Reset a submission status to pending
 */
export async function resetSubmission(submissionId) {
  const { data, error } = await supabase
    .from('submissions')
    .update({
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    console.error('Error resetting submission:', error);
    throw error;
  }

  return data;
}

