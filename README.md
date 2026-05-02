# Dynamic-Memory-Management-Visualizer-
An interactive OS project visualizing memory management concepts including Paging, Segmentation, Virtual Memory, and Allocation strategies with real-time step-by-step simulation and algorithm comparison (FIFO, LRU, Optimal).
🧠 Dynamic Memory Management Visualizer

A web-based interactive tool to simulate and visualize how Operating Systems manage memory internally. This project helps students clearly understand complex concepts like paging, segmentation, and virtual memory through real-time animations and simulations.

🚀 Project Overview

The Dynamic Memory Management Visualizer is designed as a Single Page Application (SPA) that demonstrates core OS memory management techniques.

It allows users to:

Simulate memory allocation Visualize address translation Observe page faults and replacements Understand fragmentation and allocation strategies 🧩 Features 📌 Paging & Virtual Memory Simulator Logical → Physical address mapping Page Table visualization Page fault detection FIFO & LRU page replacement algorithms Hit/Miss tracking with fault rate 📌 Segmentation & Dynamic Allocation Simulator Segment Table (Base + Limit) Memory allocation strategies: First Fit Best Fit Worst Fit Internal & External Fragmentation Free space management & hole merging ⚙️ Technologies Used Frontend: HTML5, CSS (Tailwind), JavaScript (ES6+) Visualization: Canvas API Icons & UI: Lucide Icons, Google Fonts Version Control: GitHub

🏗️ Project Structure Memory-Management-Visualizer/ │── index.html │── style.css │── script.js │── README.md

🔄 Core Modules

Paging Simulator (PagingSim) Manages page table & frames Handles page faults Implements FIFO & LRU
Segmentation Simulator (SegmentSim) Manages memory blocks Implements allocation strategies Tracks fragmentation 🧮 Algorithms Implemented FIFO (First-In-First-Out) Replaces the oldest page in memory LRU (Least Recently Used) Replaces the least recently accessed page 📊 Functionalities 📌 Paging Module Custom memory setup Page table + frame table visualization Page fault logs and statistics 📌 Segmentation Module Real-time memory map Allocation & deallocation Fragmentation analysis 🔗 Live Project
🎯 Use Case Students learning Operating Systems Visual learners Academic demos 📈 Future Enhancements Paging + Segmentation hybrid model Clock Algorithm TLB simulation Buddy Memory Allocation Export logs as PDF 📚 References MDN Web Docs W3C Standards Operating System Concepts – Silberschatz GeeksforGeeks 📌 Conclusion

This project makes OS memory concepts easier to understand through interactive visualization.
