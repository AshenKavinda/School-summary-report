// Node class for the singly linked list
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// Dynamic Singly Linked List implementation
class DLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    // Add element to the end of the list
    add(data) {
        const newNode = new Node(data);
        
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
        return true;
    }

    // Remove element by data value
    remove(data) {
        if (!this.head) {
            return false;
        }

        // If head node contains the data to remove
        if (this.head.data === data) {
            this.head = this.head.next;
            this.size--;
            return true;
        }

        let current = this.head;
        while (current.next && current.next.data !== data) {
            current = current.next;
        }

        if (current.next) {
            current.next = current.next.next;
            this.size--;
            return true;
        }

        return false;
    }

    // Remove element by index
    removeAt(index) {
        if (index < 0 || index >= this.size) {
            return false;
        }

        if (index === 0) {
            this.head = this.head.next;
            this.size--;
            return true;
        }

        let current = this.head;
        for (let i = 0; i < index - 1; i++) {
            current = current.next;
        }

        current.next = current.next.next;
        this.size--;
        return true;
    }

    // Get element at specific index
    get(index) {
        if (index < 0 || index >= this.size) {
            return null;
        }

        let current = this.head;
        for (let i = 0; i < index; i++) {
            current = current.next;
        }

        return current.data;
    }

    // Check if list contains specific data
    contains(data) {
        let current = this.head;
        while (current) {
            if (current.data === data) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    // Get the size of the list
    getSize() {
        return this.size;
    }

    // Check if list is empty
    isEmpty() {
        return this.size === 0;
    }

    // Convert list to array
    toArray() {
        const array = [];
        let current = this.head;
        while (current) {
            array.push(current.data);
            current = current.next;
        }
        return array;
    }

    // Clear all elements from the list
    clear() {
        this.head = null;
        this.size = 0;
    }

    // Display the list (for debugging)
    display() {
        if (!this.head) {
            console.log("List is empty");
            return;
        }

        let current = this.head;
        let result = "";
        while (current) {
            result += current.data;
            if (current.next) {
                result += " -> ";
            }
            current = current.next;
        }
        console.log(result);
    }
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DLinkedList, Node };
}