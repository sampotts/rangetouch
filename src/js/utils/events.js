// Trigger event
export default function trigger(element, type) {
    if (!element || !type) {
        return;
    }

    // Create and dispatch the event
    const event = new Event(type);

    // Dispatch the event
    element.dispatchEvent(event);
}
