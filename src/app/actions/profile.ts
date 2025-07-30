"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  fullName: z.string().min(2, "이름은 2자 이상이어야 합니다."),
});

export async function getProfile() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "사용자를 찾을 수 없습니다." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: "프로필을 불러오는 데 실패했습니다." };
  }

  return { profile: { ...profile, email: user.email } };
}

export async function updateProfile(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "사용자를 찾을 수 없습니다. 다시 로그인해주세요." };
  }

  const values = {
    fullName: formData.get("fullName"),
  };

  const validatedFields = profileSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "유효하지 않은 데이터입니다.",
    };
  }

  const { fullName } = validatedFields.data;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: "프로필 업데이트에 실패했습니다." };
  }

  revalidatePath("/teacher/profile");
  revalidatePath("/teacher", "layout");
  return { success: true };
}