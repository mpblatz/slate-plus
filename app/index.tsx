import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import CATEGORIES from "./categories.json";
import { styles } from "./style";

type CategoryName = keyof typeof CATEGORIES;
const CATEGORY_NAMES = Object.keys(CATEGORIES) as CategoryName[];
const MOBILE_BREAKPOINT = 768;

const DECK_META: Record<string, { label: string; color: string }> = {
    "Pop Culture & Entertainment": { label: "Pop\nCulture", color: "#e74c3c" },
    "Food & Drink": { label: "Food &\nDrink", color: "#e67e22" },
    "Travel & Adventure": { label: "Travel &\nAdventure", color: "#2ecc71" },
    "Tech & Modern Life": { label: "Tech &\nModern", color: "#3498db" },
    Classic: { label: "Classic", color: "#1a1a1a" },
    "Classic 2": { label: "Classic\n2", color: "#4a4a4a" },
    "Sports & Fitness": { label: "Sports &\nFitness", color: "#9b59b6" },
    "Music & Sounds": { label: "Music &\nSounds", color: "#e84393" },
    "Nature & Weather": { label: "Nature &\nWeather", color: "#00b894" },
};

function AutoShrinkText({
    text,
    baseSize,
    minSize,
    style,
}: {
    text: string;
    baseSize: number;
    minSize: number;
    style?: object;
}) {
    if (Platform.OS !== "web") {
        return (
            <Text
                style={[{ fontSize: baseSize, fontWeight: "700", color: "#1a1a1a", textAlign: "center" }, style]}
                adjustsFontSizeToFit
                numberOfLines={1}
            >
                {text}
            </Text>
        );
    }

    const containerRef = useRef<View>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [fontSize, setFontSize] = useState(baseSize);

    useEffect(() => {
        if (containerWidth <= 0) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            setFontSize(baseSize);
            return;
        }

        let lo = minSize;
        let hi = baseSize;
        let best = minSize;

        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            ctx.font = `700 ${mid}px system-ui, -apple-system, sans-serif`;
            const measured = ctx.measureText(text).width;
            if (measured <= containerWidth) {
                best = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }

        setFontSize(best);
    }, [text, containerWidth, baseSize, minSize]);

    return (
        <View
            ref={containerRef}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            style={{ width: "100%", alignItems: "center" }}
        >
            <Text
                style={[{ fontSize, fontWeight: "700", color: "#1a1a1a", textAlign: "center" }, style]}
                numberOfLines={1}
            >
                {text}
            </Text>
        </View>
    );
}

function DeckShelf({
    selected,
    onSelect,
    small,
}: {
    selected: CategoryName;
    onSelect: (c: CategoryName) => void;
    small?: boolean;
}) {
    return (
        <View style={[styles.shelfContainer, small && { marginBottom: 10 }]}>
            <Text style={[styles.shelfLabel, small && { fontSize: 10, marginBottom: 8 }]}>Decks</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.shelfScrollContent, small && { gap: 10 }]}
            >
                {CATEGORY_NAMES.map((category) => {
                    const meta = DECK_META[category] || { label: category, color: "#888" };
                    const isSelected = selected === category;
                    const count = (CATEGORIES[category] as string[]).length;
                    return (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.deckCard,
                                { width: 80, height: 112 },
                                { backgroundColor: meta.color },
                                isSelected && styles.deckCardActive,
                            ]}
                            onPress={() => onSelect(category)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.deckCardCount, small && { fontSize: 8.5 }]}>{count} cards</Text>
                            <Text style={[styles.deckCardName, small && { fontSize: 10, lineHeight: 13 }]}>
                                {meta.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

export default function Index() {
    const [selectedCategory, setSelectedCategory] = useState<CategoryName>("Pop Culture & Entertainment");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShuffled, setIsShuffled] = useState(false);
    const [shuffledPrompts, setShuffledPrompts] = useState<string[]>([...CATEGORIES["Pop Culture & Entertainment"]]);

    const { width, height } = useWindowDimensions();
    const [layoutReady, setLayoutReady] = useState(Platform.OS !== "web");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const changeCategory = (category: CategoryName) => {
        setSelectedCategory(category);
        setShuffledPrompts([...CATEGORIES[category]]);
        setCurrentIndex(0);
        setIsShuffled(false);
    };

    const nextCard = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledPrompts.length);
    };

    const previousCard = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? shuffledPrompts.length - 1 : prevIndex - 1));
    };

    const shuffleCards = () => {
        const shuffled = [...CATEGORIES[selectedCategory]].sort(() => Math.random() - 0.5);
        setShuffledPrompts(shuffled);
        setCurrentIndex(0);
        setIsShuffled(true);
    };

    const resetCards = () => {
        setShuffledPrompts([...CATEGORIES[selectedCategory]]);
        setCurrentIndex(0);
        setIsShuffled(false);
    };

    useEffect(() => {
        if (Platform.OS === "web" && width > 0 && height > 0) {
            setLayoutReady(true);
        }
    }, [width, height]);

    // Horizontal (arrows-on-the-side) layout is opt-in only, via the fullscreen
    // button — it's never triggered automatically by orientation or window shape.
    useEffect(() => {
        if (Platform.OS !== "web") return;
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                try {
                    (screen.orientation as ScreenOrientation & { unlock?: () => void })?.unlock?.();
                } catch {
                    // orientation unlock unsupported — nothing to do
                }
            }
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const enterFullscreen = async () => {
        if (Platform.OS !== "web") return;
        try {
            await document.documentElement.requestFullscreen();
        } catch {
            // fullscreen request denied/unsupported — still show the horizontal layout
        }
        try {
            // Only works on Android Chrome/Edge; iOS Safari has no orientation-lock API,
            // so on iPhone/iPad the user still has to physically rotate the device.
            await (
                screen.orientation as ScreenOrientation & { lock?: (orientation: string) => Promise<void> }
            )?.lock?.("landscape");
        } catch {
            // orientation lock unsupported — ignore
        }
        setIsFullscreen(true);
    };

    const exitFullscreen = async () => {
        if (Platform.OS !== "web") return;
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch {
            // ignore
        }
        try {
            screen.orientation?.unlock?.();
        } catch {
            // ignore
        }
        setIsFullscreen(false);
    };

    // On web, only phone/tablet-sized viewports count as "mobile" — width-only on
    // purpose: desktop windows are essentially never this narrow, but desktop
    // *height* commonly dips below the breakpoint (e.g. a 1366x768 laptop screen),
    // so folding height into this check would misclassify real desktops.
    const isMobile = Platform.OS !== "web" || width < MOBILE_BREAKPOINT;

    if (!layoutReady) {
        return <View style={styles.container} />;
    }

    // ── Fullscreen (horizontal, arrows-on-the-side) ─────────────────────
    if (isFullscreen) {
        return (
            <View style={styles.landscapeContainer}>
                <TouchableOpacity style={styles.landscapeButton} onPress={previousCard} activeOpacity={0.7}>
                    <Text style={styles.landscapeButtonText}>&larr;</Text>
                </TouchableOpacity>

                <View style={styles.landscapeCard}>
                    <TouchableOpacity style={styles.fullscreenButton} onPress={exitFullscreen} activeOpacity={0.7}>
                        <Text style={styles.fullscreenButtonText}>&#10005;</Text>
                    </TouchableOpacity>
                    <AutoShrinkText text={shuffledPrompts[currentIndex]} baseSize={80} minSize={32} />
                    <Text style={styles.landscapeCounter}>
                        {currentIndex + 1} / {shuffledPrompts.length}
                    </Text>
                </View>

                <TouchableOpacity style={styles.landscapeButton} onPress={nextCard} activeOpacity={0.7}>
                    <Text style={styles.landscapeButtonText}>&rarr;</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Desktop ────────────────────────────────────────────────────────
    if (!isMobile) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.desktopContainer}>
                    <View style={styles.desktopHeader}>
                        <Text style={styles.desktopTitle}>Slate+</Text>
                    </View>

                    <DeckShelf selected={selectedCategory} onSelect={changeCategory} />

                    <View style={styles.desktopCard}>
                        {Platform.OS === "web" && (
                            <TouchableOpacity
                                style={styles.fullscreenButton}
                                onPress={enterFullscreen}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.fullscreenButtonText}>&#9974;</Text>
                            </TouchableOpacity>
                        )}
                        <AutoShrinkText text={shuffledPrompts[currentIndex]} baseSize={64} minSize={28} />
                        <Text style={styles.landscapeCounter}>
                            {currentIndex + 1} / {shuffledPrompts.length}
                        </Text>
                    </View>

                    <View style={styles.desktopControlsRow}>
                        <TouchableOpacity style={styles.desktopNavButton} onPress={previousCard}>
                            <Text style={styles.desktopNavButtonText}>&larr;</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.desktopShuffleButton, isShuffled && styles.resetButton]}
                            onPress={isShuffled ? resetCards : shuffleCards}
                        >
                            <Text style={[styles.shuffleButtonText, isShuffled && styles.resetButtonText]}>
                                {isShuffled ? "Reset" : "Shuffle"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.desktopNavButton} onPress={nextCard}>
                            <Text style={styles.desktopNavButtonText}>&rarr;</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        );
    }

    // ── Mobile Portrait ───────────────────────────────────────────────
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.mobileTitle}>Slate+</Text>
                </View>

                {/* Deck shelf */}
                <DeckShelf selected={selectedCategory} onSelect={changeCategory} />

                <View style={styles.cardContainer}>
                    <View
                        style={[
                            styles.card,
                            {
                                width: width - 60,
                                height: height * 0.35,
                            },
                        ]}
                    >
                        {Platform.OS === "web" && (
                            <TouchableOpacity
                                style={styles.fullscreenButton}
                                onPress={enterFullscreen}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.fullscreenButtonText}>&#9974;</Text>
                            </TouchableOpacity>
                        )}
                        <AutoShrinkText text={shuffledPrompts[currentIndex]} baseSize={52} minSize={24} />
                        <Text style={styles.mobileCounter}>
                            {currentIndex + 1} / {shuffledPrompts.length}
                        </Text>
                    </View>
                </View>

                <View style={styles.mobileControlsRow}>
                    <TouchableOpacity style={styles.mobileNavButton} onPress={previousCard}>
                        <Text style={styles.mobileNavButtonText}>&larr;</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.shuffleButton, isShuffled && styles.resetButton]}
                        onPress={isShuffled ? resetCards : shuffleCards}
                    >
                        <Text style={[styles.shuffleButtonText, isShuffled && styles.resetButtonText]}>
                            {isShuffled ? "Reset" : "Shuffle"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.mobileNavButton} onPress={nextCard}>
                        <Text style={styles.mobileNavButtonText}>&rarr;</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}
