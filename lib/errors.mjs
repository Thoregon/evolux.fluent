/**
 * defines all errors used in dyncomponents
 *
 * @author: blukassen
 */
import EError from '/evolux.supervise/lib/error/eerror.mjs';

export const errNoSegmentDefined        = (msg) => new EError(`No segment defined: ${msg}`, "FLUENT:00001");
