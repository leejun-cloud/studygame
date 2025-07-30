import { getProfile } from "@/app/actions/profile";
import { ProfileForm } from "@/components/teacher/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const { profile, error } = await getProfile();

  if (error || !profile) {
    redirect("/login");
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>프로필</CardTitle>
            <CardDescription>
              이름과 아바타를 관리하세요. 아바타는 Google 프로필 사진을 따릅니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}