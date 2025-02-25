#include <iostream>
#include <fstream>
#include <filesystem>
#include <chrono>

namespace fs = std::filesystem;

bool checkVideoStored(std::string videoPath) {
    return fs::exists(videoPath);
}

void rewardUser(std::string userId, std::string videoId) {
    if (checkVideoStored("videos/" + videoId + ".mp4")) {
        std::cout << "User " << userId << " stored video " << videoId << "\n";

        // Log rewards
        std::ofstream rewards("huobz_rewards.txt", std::ios::app);
        rewards << userId << "," << videoId << ",+50 HC\n";
        rewards.close();

        std::cout << "✅ 50 HuobzCoins credited to " << userId << "!\n";
    } else {
        std::cout << "⚠ Video not found on device!\n";
    }
}

int main() {
    std::string userId = "user123";
    std::string videoId = "video456";

    rewardUser(userId, videoId);
    return 0;
}
