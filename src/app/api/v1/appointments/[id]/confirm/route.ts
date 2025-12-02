import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/withAuth";
import { dynamoDBService } from "@/lib/dynamodb";
import { applyTransition } from "../../stateMachine";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appointment = await dynamoDBService.getAppointmentById(params.id);

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    let nextStatus;

    try {
      nextStatus = applyTransition(appointment.status, "confirmado");
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const updated = await dynamoDBService.updateAppointment(params.id, {
      status: nextStatus,
      confirmedAt: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return NextResponse.json(
      { error: "Failed to confirm appointment" },
      { status: 500 }
    );
  }
}
