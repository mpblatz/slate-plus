import { Stack } from "expo-router";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import CATEGORIES from "./categories.json";
import { styles } from "./style";

type CategoryName = keyof typeof CATEGORIES;

export default function Index() {
    const [selectedCategory, setSelectedCategory] = useState<CategoryName>("Pop Culture & Entertainment");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShuffled, setIsShuffled] = useState(false);
    const [shuffledPrompts, setShuffledPrompts] = useState<string[]>([...CATEGORIES["Pop Culture & Entertainment"]]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { width, height } = useWindowDimensions();

    const changeCategory = (category: CategoryName) => {
        setSelectedCategory(category);
        setShuffledPrompts([...CATEGORIES[category]]);
        setCurrentIndex(0);
        setIsShuffled(false);
        setIsDropdownOpen(false);
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

    const isLandscape = width > height;

    if (Platform.OS === "web" && isLandscape) {
        return (
            <View style={styles.desktopContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Slate Plus</Text>
                    <Text style={styles.subtitle}>
                        Card {currentIndex + 1} of {shuffledPrompts.length}
                    </Text>
                </View>
                <View style={styles.dropdownContainer}>
                    <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <Text style={styles.dropdownButtonText}>{selectedCategory}</Text>
                        <Text style={styles.dropdownArrow}>{isDropdownOpen ? "▲" : "▼"}</Text>
                    </TouchableOpacity>

                    {isDropdownOpen && (
                        <View style={styles.dropdownMenu}>
                            {(Object.keys(CATEGORIES) as CategoryName[]).map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.dropdownItem,
                                        selectedCategory === category && styles.dropdownItemActive,
                                    ]}
                                    onPress={() => changeCategory(category)}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownItemText,
                                            selectedCategory === category && styles.dropdownItemTextActive,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.desktopRow}>
                    {/* Left Button */}
                    <TouchableOpacity style={styles.desktopButton} onPress={previousCard} activeOpacity={0.7}>
                        <Text style={styles.desktopButtonText}>←</Text>
                    </TouchableOpacity>

                    {/* Card */}
                    <View style={styles.desktopCard}>
                        <Text style={styles.landscapePromptText}>{shuffledPrompts[currentIndex]}</Text>
                        <Text style={styles.landscapeCounter}>
                            {currentIndex + 1} / {shuffledPrompts.length}
                        </Text>
                    </View>

                    {/* Right Button */}
                    <TouchableOpacity style={styles.desktopButton} onPress={nextCard} activeOpacity={0.7}>
                        <Text style={styles.desktopButtonText}>→</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.desktopShuffleButton, isShuffled && styles.resetButton]}
                    onPress={isShuffled ? resetCards : shuffleCards}
                >
                    <Text style={styles.shuffleButtonText}>{isShuffled ? "↻ Reset Order" : "🔀 Shuffle Cards"}</Text>
                </TouchableOpacity>
            </View>
        );
    } else {
        if (isLandscape) {
            return (
                <>
                    <View style={styles.landscapeContainer}>
                        {/* Left Button */}
                        <TouchableOpacity style={styles.landscapeButton} onPress={previousCard} activeOpacity={0.7}>
                            <Text style={styles.landscapeButtonText}>←</Text>
                        </TouchableOpacity>

                        {/* Card */}
                        <View style={styles.landscapeCard}>
                            <Text style={styles.landscapePromptText}>{shuffledPrompts[currentIndex]}</Text>
                            <Text style={styles.landscapeCounter}>
                                {currentIndex + 1} / {shuffledPrompts.length}
                            </Text>
                        </View>

                        {/* Right Button */}
                        <TouchableOpacity style={styles.landscapeButton} onPress={nextCard} activeOpacity={0.7}>
                            <Text style={styles.landscapeButtonText}>→</Text>
                        </TouchableOpacity>
                    </View>
                </>
            );
        }

        // Portrait layout (original)
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Slate Plus</Text>
                        <Text style={styles.subtitle}>
                            Card {currentIndex + 1} of {shuffledPrompts.length}
                        </Text>
                    </View>

                    {/* Category Dropdown */}
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <Text style={styles.dropdownButtonText}>{selectedCategory}</Text>
                            <Text style={styles.dropdownArrow}>{isDropdownOpen ? "▲" : "▼"}</Text>
                        </TouchableOpacity>

                        {isDropdownOpen && (
                            <View style={styles.dropdownMenu}>
                                {(Object.keys(CATEGORIES) as CategoryName[]).map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.dropdownItem,
                                            selectedCategory === category && styles.dropdownItemActive,
                                        ]}
                                        onPress={() => changeCategory(category)}
                                    >
                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                selectedCategory === category && styles.dropdownItemTextActive,
                                            ]}
                                        >
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.cardContainer}>
                        <View
                            style={[
                                styles.card,
                                {
                                    width: width - 60,
                                    height: isLandscape ? "95%" : height * 0.45,
                                },
                            ]}
                        >
                            <Text style={styles.promptText}>{shuffledPrompts[currentIndex]}</Text>
                        </View>
                    </View>

                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.button} onPress={previousCard}>
                            <Text style={styles.buttonText}>← Previous</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={nextCard}>
                            <Text style={styles.buttonText}>Next →</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomControls}>
                        <TouchableOpacity
                            style={[styles.shuffleButton, isShuffled && styles.resetButton]}
                            onPress={isShuffled ? resetCards : shuffleCards}
                        >
                            <Text style={styles.shuffleButtonText}>
                                {isShuffled ? "↻ Reset Order" : "🔀 Shuffle Cards"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        );
    }
}
