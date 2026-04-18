# React Hook Form Reference

**Version:** 7.72.0 | **Docs:** https://react-hook-form.com

## Basic Usage with Zod

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function SignUpForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <input {...form.register("name")} />
        {form.formState.errors.name && (
          <p>{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <input {...form.register("email")} type="email" />
        {form.formState.errors.email && (
          <p>{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <input {...form.register("password")} type="password" />
        {form.formState.errors.password && (
          <p>{form.formState.errors.password.message}</p>
        )}
      </div>

      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Submitting..." : "Sign Up"}
      </button>
    </form>
  );
}
```

## With shadcn/ui Form Components

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
```

## Form Methods

```ts
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { name: "", email: "" },
  mode: "onChange", // validation trigger: onChange | onBlur | onSubmit | onTouched
});

// Reset form
form.reset();
form.reset({ name: "Default", email: "default@example.com" });

// Set individual field value
form.setValue("name", "New Name");
form.setValue("name", "New Name", { shouldValidate: true, shouldDirty: true });

// Trigger validation
form.trigger();
form.trigger("email");

// Get field value
const name = form.getValues("name");
const allValues = form.getValues();

// Check form state
form.formState.isDirty; // has any field changed?
form.formState.isSubmitting; // is onSubmit running?
form.formState.isValid; // is form valid?
form.formState.errors; // validation errors

// Watch field changes
const name = form.watch("name");
const allValues = form.watch();

// With useWatch hook (better performance)
const name = useWatch({ control: form.control, name: "name" });
```

## useWatch

```tsx
import { useForm, useWatch } from "react-hook-form";

function ContentEditor() {
  const form = useForm({ defaultValues: { title: "", slug: "" } });
  const title = useWatch({ control: form.control, name: "title" });

  useEffect(() => {
    if (title) {
      form.setValue("slug", generateSlug(title), { shouldValidate: true });
    }
  }, [title, form]);
}
```

## Array Fields

```tsx
import { useFieldArray } from "react-hook-form";

function TagsForm() {
  const form = useForm({
    defaultValues: { tags: [{ name: "" }] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...form.register(`tags.${index}.name`)} />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: "" })}>Add Tag</button>
    </div>
  );
}
```

## Conditional Fields

```tsx
function ConditionalForm() {
  const form = useForm({
    defaultValues: { sendEmail: false, email: "" },
  });

  const sendEmail = form.watch("sendEmail");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input type="checkbox" {...form.register("sendEmail")} />

      {sendEmail && (
        <input {...form.register("email", { required: "Email required" })} />
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## File Upload

```tsx
function FileUploadForm() {
  const form = useForm({
    defaultValues: { file: null as File | null },
  });

  const onSubmit = async (data: { file: File | null }) => {
    if (!data.file) return;

    const formData = new FormData();
    formData.append("file", data.file);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          form.setValue("file", file);
        }}
      />
      <button type="submit">Upload</button>
    </form>
  );
}
```

## Best Practices

1. **Zod resolver** — always use schema validation
2. **`useWatch` over `watch`** — better performance for individual fields
3. **`mode: "onChange"`** — real-time validation
4. **`shouldValidate`** — validate when setting values programmatically
5. **`shouldDirty`** — mark form dirty when setting values
6. **`isSubmitting`** — disable submit button during submission
7. **`formState.errors`** — show validation messages
8. **`reset()`** — clear form after successful submission
9. **`useFieldArray`** — for dynamic array fields
10. **Server Actions** — integrate with `"use server"` for mutations
