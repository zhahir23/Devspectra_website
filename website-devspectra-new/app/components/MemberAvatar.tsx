import Image from "next/image";
import { isExternalImage } from "@/app/lib/api";
import type { TeamMember } from "@/app/components/TeamMemberModal";

/**
 * Lingkaran/kotak avatar anggota tim: foto dari dashboard kalau ada, selain itu inisial.
 * `className` menentukan ukuran, bentuk, dan warna latarnya (sama seperti sebelum ada foto).
 */
export default function MemberAvatar({
  member,
  className,
  sizes,
}: {
  member: Pick<TeamMember, "initials" | "photo">;
  className: string;
  sizes: string;
}) {
  return (
    <div className={`${className} relative overflow-hidden`}>
      {member.photo ? (
        <Image
          src={member.photo}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          // Foto dari backend dibuka langsung (sudah diperkecil saat diunggah dari dashboard)
          unoptimized={isExternalImage(member.photo)}
        />
      ) : (
        member.initials
      )}
    </div>
  );
}
