const CONTROLLER_FIELDS = [ 'm_hController', 'm_hDefaultController' ];

export default function resolvePlayerName(demo, command) {
  const pawnHandle = command.state?.base?.pawnEntityHandle;

  if (typeof pawnHandle !== 'number') {
    return null;
  }

  const pawn = demo.getEntityByHandle(pawnHandle);

  if (pawn === null) {
    return null;
  }

  for (const field of CONTROLLER_FIELDS) {
    const handle = pawn.getField(field);
    const controller = typeof handle === 'number' ? demo.getEntityByHandle(handle) : null;

    if (controller !== null) {
      return controller.getField('m_iszPlayerName') ?? null;
    }
  }

  return null;
}
