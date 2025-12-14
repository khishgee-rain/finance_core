import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { getUserProfile } from "@/lib/data";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-foreground/60">Тохиргоо</p>
        <h1 className="text-3xl font-semibold">Профайл ба цалин</h1>
        <p className="text-sm text-foreground/60">Валют, цалин, цалингийн өдрөө тохируулна.</p>
      </div>

      <Card>
        <ProfileForm
          name={user.name}
          email={user.email}
          currency={user.currency}
          salaryAmount={Number(user.salaryAmount)}
          payday15={user.payday15}
          payday30={user.payday30}
        />
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Цалингийн бодлого</h2>
        <p className="text-sm text-foreground/70">
          Цалин нь самбар дээр автоматаар баталгаажна (эсвэл товчоор дахин идэвхжүүлж болно). Сонгосон
          сард 15, 30-нд орлого гүйлгээ хэлбэрээр нэмэгдэнэ; давхардахгүй.
        </p>
      </Card>
    </div>
  );
}
