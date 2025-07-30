"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "이름은 2자 이상이어야 합니다.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  profile: {
    full_name: string | null;
    email: string | undefined;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile.full_name || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("fullName", data.fullName);

    const result = await updateProfile(formData);

    if (result.error) {
      toast.error("프로필 업데이트에 실패했습니다.");
    } else {
      toast.success("프로필이 성공적으로 업데이트되었습니다!");
      form.reset({ fullName: data.fullName });
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormDescription>
                퀴즈와 결과에 표시될 이름입니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>이메일</FormLabel>
          <FormControl>
            <Input value={profile.email} readOnly disabled />
          </FormControl>
          <FormDescription>
            이메일 주소는 변경할 수 없습니다.
          </FormDescription>
        </FormItem>
        <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          프로필 저장
        </Button>
      </form>
    </Form>
  );
}