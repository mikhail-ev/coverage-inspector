const lodash = require('lodash');

class TreeNode {
    constructor(name) {
        this.name = name;
        this.info = {};
    }

    setPath(path) {
        if (typeof this.path !== 'undefined' && this.path !== path) {
            throw 'There was an attempt to rewrite path of a file'
        }
        this.info.path = path;
        return this;
    }

    setText(text) {
        if (typeof this.text !== 'undefined' && this.text !== text) {
            throw 'There was an attempt to rewrite text of a file'
        }
        this.info.text = text
        return this;
    }

    assignChunk(chunkPath, startInChunk, endInChunk) {
        if (!this.info.chunks) {
            this.info.chunks = []
        }
        this.info.chunks.push({
            path: chunkPath,
            start: startInChunk,
            end: endInChunk
        });
        return this;
    }

    toJSON() {
        return {
            ...this,
            children: this.children && lodash.sortBy(this.children, 'name')
        }
    }
}

class Tree {
    chunks = {}

    constructor(appUrl, examUrl) {
        this.appUrl = appUrl;
        this.root = {
            info: {},
            name: examUrl
        }
    }


    getNode(path) {
        const parts = path.split('/')
        return this.layPath(this.root, parts)
    }

    markDuplicates(path) {
        const parts = path.split('/')
        this.markPath(this.root, parts)
    }

    markPath(node, parts) {
        const nextParts = [...parts]
        const current = nextParts.shift()

        if (typeof current === 'undefined' || typeof node.children === 'undefined') {
            return;
        }

        node.info.containsDuplicates = true;

        const encodedCurrent = encodeURIComponent(current)
        const nextNode = node.children.find((child) => child.name === encodedCurrent)

        this.markPath(nextNode, nextParts)
    }

    layPath(node, parts) {
        const nextParts = [...parts]
        const current = nextParts.shift()
        if (current) {
            let nextNode;
            if (!node.children) {
                node.children = []
            }
            const encodedCurrent = encodeURIComponent(current)
            const existingNode = node.children.find((child) => child.name === encodedCurrent)
            if (existingNode) {
                nextNode = existingNode
            } else {
                nextNode = new TreeNode(encodeURIComponent(current))
                node.children.push(nextNode)
            }
            return this.layPath(nextNode, nextParts)
        }
        return node
    }
}

module.exports = {
    Tree
}
