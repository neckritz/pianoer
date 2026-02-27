import React from 'react';
import {
    NAV_KEY_BINDINGS,
    SCALE_KEY_LAYOUTS,
    SHIFT_KEY_BINDINGS,
} from './notes';

const GUIDE_LAYOUTS = ['QWERTY', 'QWERTZ'];

const toDisplayKey = (keyValue) => {
    if (typeof keyValue !== 'string' || !keyValue.length) return '';
    if (keyValue === ' ') return 'Space';
    return keyValue.length === 1 ? keyValue.toUpperCase() : keyValue;
};

const toLowerKey = (keyValue) => {
    if (typeof keyValue !== 'string') return '';
    return keyValue.toLowerCase();
};

const KeyCap = ({
    keyValue,
    hint,
    pressed = false,
    onInputDown,
    onInputUp,
    tone = 'neutral',
}) => {
    const handleDown = (event) => {
        event.preventDefault();
        if (!keyValue) return;
        onInputDown?.(keyValue);
    };

    const handleUp = () => {
        if (!keyValue) return;
        onInputUp?.(keyValue);
    };

    return (
        <button
            type="button"
            className={`guide-key guide-key--${tone} ${pressed ? 'is-pressed' : ''}`}
            onPointerDown={handleDown}
            onPointerUp={handleUp}
            onPointerLeave={handleUp}
            onPointerCancel={handleUp}
            onContextMenu={(event) => event.preventDefault()}
        >
            <span className="guide-key__label">{toDisplayKey(keyValue)}</span>
            {hint ? <span className="guide-key__hint">{hint}</span> : null}
        </button>
    );
};

const sortDegrees = (degrees = []) => [...degrees].sort((a, b) => a.degreeOffset - b.degreeOffset);

const KeyBindingGuide = ({
    layout = 'QWERTZ',
    setLayoutMode,
    pressedInputKeys = [],
    onInputDown,
    onInputUp,
}) => {
    const scaleLayout = SCALE_KEY_LAYOUTS[layout] || { left: { degrees: [] }, right: { degrees: [] } };
    const shiftBindings = SHIFT_KEY_BINDINGS[layout] || { left: {}, right: {} };
    const rootBindings = NAV_KEY_BINDINGS?.root || {};
    const qualityBindings = NAV_KEY_BINDINGS?.quality || {};

    const leftDegrees = sortDegrees(scaleLayout.left?.degrees || []);
    const rightDegrees = sortDegrees(scaleLayout.right?.degrees || []);
    const pressedLookup = React.useMemo(
        () => new Set(pressedInputKeys.map((key) => toLowerKey(key))),
        [pressedInputKeys]
    );
    const isPressed = (keyValue) => pressedLookup.has(toLowerKey(keyValue));

    return (
        <aside className="key-guide-shell" aria-label="Keyboard guide">
            <div className="key-guide-top">
                <div className="guide-pair">
                    <div className="guide-control">
                        <KeyCap
                            keyValue={rootBindings.prev}
                            pressed={isPressed(rootBindings.prev)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                        />
                        <span className="guide-control__label">Scale -</span>
                    </div>
                    <div className="guide-control">
                        <KeyCap
                            keyValue={rootBindings.next}
                            pressed={isPressed(rootBindings.next)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                        />
                        <span className="guide-control__label">Scale +</span>
                    </div>
                </div>

                <div className="guide-layout-switch">
                    {GUIDE_LAYOUTS.map((layoutOption) => (
                        <button
                            key={layoutOption}
                            type="button"
                            className={`guide-layout-btn ${layout === layoutOption ? 'is-active' : ''}`}
                            onClick={() => setLayoutMode?.(layoutOption)}
                        >
                            {layoutOption}
                        </button>
                    ))}
                </div>

                <div className="guide-pair">
                    <div className="guide-control">
                        <KeyCap
                            keyValue={qualityBindings.minor}
                            pressed={isPressed(qualityBindings.minor)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                        />
                        <span className="guide-control__label">Quality -</span>
                    </div>
                    <div className="guide-control">
                        <KeyCap
                            keyValue={qualityBindings.major}
                            pressed={isPressed(qualityBindings.major)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                        />
                        <span className="guide-control__label">Quality +</span>
                    </div>
                </div>
            </div>

            <div className="key-guide-middle">
                <section className="guide-hand">
                    <div className="guide-hand__row">
                        {leftDegrees.map((item) => (
                            <KeyCap
                                key={`left-${item.key}`}
                                keyValue={item.key}
                                pressed={isPressed(item.key)}
                                onInputDown={onInputDown}
                                onInputUp={onInputUp}
                                tone="left"
                            />
                        ))}
                    </div>
                    <p className="guide-title">Left Hand Keys</p>
                </section>

                <section className="guide-hand">
                    <div className="guide-hand__row">
                        {rightDegrees.map((item) => (
                            <KeyCap
                                key={`right-${item.key}`}
                                keyValue={item.key}
                                pressed={isPressed(item.key)}
                                onInputDown={onInputDown}
                                onInputUp={onInputUp}
                                tone="right"
                            />
                        ))}
                    </div>
                    <p className="guide-title">Right Hand Keys</p>
                </section>
            </div>

            <div className="key-guide-bottom">
                <section className="guide-position">
                    <div className="guide-hand__row">
                        <KeyCap
                            keyValue={shiftBindings.left?.major_downshift_key}
                            hint="<<"
                            pressed={isPressed(shiftBindings.left?.major_downshift_key)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                            tone="left"
                        />
                        <KeyCap
                            keyValue={shiftBindings.left?.minor_downshift_key}
                            hint="<"
                            pressed={isPressed(shiftBindings.left?.minor_downshift_key)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                            tone="left"
                        />
                        <KeyCap
                            keyValue={shiftBindings.left?.minor_upshift_key}
                            hint=">"
                            pressed={isPressed(shiftBindings.left?.minor_upshift_key)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                            tone="left"
                        />
                        <KeyCap
                            keyValue={shiftBindings.left?.major_upshift_key}
                            hint=">>"
                            pressed={isPressed(shiftBindings.left?.major_upshift_key)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                            tone="left"
                        />
                    </div>
                    <p className="guide-title">Left Hand Position</p>
                </section>

                <section className="guide-position">
                    <div className="guide-hand__row">
                        <KeyCap
                            keyValue={shiftBindings.right?.major_downshift_key}
                            hint="<<"
                            pressed={isPressed(shiftBindings.right?.major_downshift_key)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                            tone="right"
                        />
                        <KeyCap
                            keyValue={shiftBindings.right?.minor_downshift_key}
                            hint="<"
                            pressed={isPressed(shiftBindings.right?.minor_downshift_key)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                            tone="right"
                        />
                        <KeyCap
                            keyValue={shiftBindings.right?.minor_upshift_key}
                            hint=">"
                            pressed={isPressed(shiftBindings.right?.minor_upshift_key)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                            tone="right"
                        />
                        <KeyCap
                            keyValue={shiftBindings.right?.major_upshift_key}
                            hint=">>"
                            pressed={isPressed(shiftBindings.right?.major_upshift_key)}
                            onInputDown={onInputDown}
                            onInputUp={onInputUp}
                            tone="right"
                        />
                    </div>
                    <p className="guide-title">Right Hand Position</p>
                </section>
            </div>
        </aside>
    );
};

export default KeyBindingGuide;
