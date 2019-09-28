/**
 * defines all errors used in dyncomponents
 *
 * @author: blukassen
 */
import EError from '/evolux.supervise/lib/error/eerror.mjs';

export const ErrNoSegmentDefined        = (msg) => new EError(`No segment defined: ${msg}`, "FLUENT:00001");
export const ErrNoBeginDefined          = (msg) => new EError(`No begin defined: ${msg}`, "FLUENT:00001");
