import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { event_id: string } }
) {
  if (!(await params).event_id) {
    return NextResponse.json({ organizers: [] }, { status: 400 });
  }

  try {
    const organizers = await prisma.organiser_for_event.findMany({
      where: {
        event_id: (await params).event_id,
      },
      include: {
        organiser: {
          select: {
            organiser_id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    const formattedOrganizers = organizers.map((ofe) => ({
      organiser_id: ofe.organiser.organiser_id,
      first_name: ofe.organiser.first_name,
      last_name: ofe.organiser.last_name,
    }));

    return NextResponse.json({ organizers: formattedOrganizers });
  } catch (error) {
    console.error("Error fetching event organizers:", error);
    return NextResponse.json(
      { organizers: [], error: "Failed to fetch event organizers" },
      { status: 500 }
    );
  }
}