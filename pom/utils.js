function cleanup(lines) {
    return lines
        .filter((line) => line.startsWith('[INFO] +-') || line.startsWith('[INFO] \\-'))
        .map((line) => line.replace('[INFO] +- ', '').replace('[INFO] \\- ', ''))
        .sort();
}

module.exports = {
    cleanup
};