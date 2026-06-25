#!/bin/bash
# Universal Hibernate Fix for AlphaOS Knowledge Services
# Stops problematic services before hibernation and restarts them on wakeup

case "$1" in
    pre)
        echo "AlphaOS: Preparing for $2... stopping services"
        # System services
        systemctl stop tailscaled
        
        # User services (Alpha)
        systemctl --user -M alpha@ stop knowledge-base-watch.service
        systemctl --user -M alpha@ stop fuel-watch.service
        systemctl --user -M alpha@ stop fuel-sync-watcher.service
        ;;
    post)
        echo "AlphaOS: Waking up from $2... restarting services"
        # System services
        systemctl start tailscaled
        
        # User services (Alpha)
        systemctl --user -M alpha@ start knowledge-base-watch.service
        systemctl --user -M alpha@ start fuel-watch.service
        systemctl --user -M alpha@ start fuel-sync-watcher.service
        ;;
esac
