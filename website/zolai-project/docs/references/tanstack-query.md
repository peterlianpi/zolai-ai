# TanStack React Query Reference

**Version:** 5.96.1 | **Docs:** https://tanstack.com/query/latest

## Provider Setup

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## Basic Query

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";

function PostsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render data */}</div>;
}
```

## Query with Parameters

```tsx
function PostDetail({ postId }: { postId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["posts", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!postId, // only fetch if postId exists
  });
}
```

## Infinite Query

```tsx
"use client";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

function InfinitePosts() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/posts?page=${pageParam}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;
      if (meta && meta.page < meta.totalPages) return meta.page + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const posts = data?.pages.flatMap((page) => page?.data?.posts ?? []) ?? [];

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
```

## Mutations

```tsx
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function CreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ title: "New Post" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Creating..." : "Create"}
    </button>
  );
}
```

## Query Invalidation

```ts
// After mutation, refetch related queries
queryClient.invalidateQueries({ queryKey: ["posts"] });
queryClient.invalidateQueries({ queryKey: ["posts", postId] });
queryClient.invalidateQueries({ queryKey: ["media-browser"] });

// Refetch immediately
queryClient.refetchQueries({ queryKey: ["posts"] });

// Remove from cache
queryClient.removeQueries({ queryKey: ["posts", postId] });

// Update cache directly
queryClient.setQueryData(["posts", postId], (old: Post | undefined) => ({
  ...old,
  ...updatedData,
}));
```

## Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["posts", newData.id] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["posts", newData.id]);

    // Optimistically update
    queryClient.setQueryData(["posts", newData.id], (old: Post) => ({
      ...old,
      ...newData,
    }));

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(["posts", newData.id], context?.previous);
  },
  onSettled: (data, error, newData) => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ["posts", newData.id] });
  },
});
```

## Query Options

```ts
useQuery({
  queryKey: ["posts", id],
  queryFn: fetchPost,
  staleTime: 1000 * 60 * 5, // 5 min before refetch
  gcTime: 1000 * 60 * 30, // 30 min before garbage collection
  retry: 1, // retry failed requests once
  retryDelay: 1000, // wait 1s between retries
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  enabled: !!id, // conditional fetching
  select: (data) => data.title, // transform response
});
```

## Prefetching

```ts
// Prefetch in Server Component
const queryClient = new QueryClient();
await queryClient.prefetchQuery({
  queryKey: ["posts", id],
  queryFn: () => fetchPost(id),
});

// Prefetch on hover
function PostLink({ id, title }) {
  const queryClient = useQueryClient();

  return (
    <a
      href={`/posts/${id}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ["posts", id],
          queryFn: () => fetchPost(id),
        });
      }}
    >
      {title}
    </a>
  );
}
```

## Best Practices

1. **Unique query keys** — include all parameters in key
2. **Stale time** — set appropriate caching duration
3. **Invalidation** — refetch after mutations
4. **Error boundaries** — wrap query components
5. **Loading states** — show skeletons, not spinners
6. **Optimistic updates** — for instant UI feedback
7. **Prefetching** — for anticipated navigation
8. **Select** — transform data at query level
9. **Enabled** — conditional fetching
10. **GC time** — manage memory with garbage collection
