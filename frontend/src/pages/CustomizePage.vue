<template>
     <div id="appCustomize">
         <div class="notification-form">
            <h2 class="form-title">Notification Preferences</h2>
            <form id="notificationSettingsForm">
                <div class="form-group">
                    <label for="daysBeforeExpiry">Notify me before an item expires (in days):</label>
                    <input type="number" class="form-control" id="daysBeforeExpiry" min="1" max="30" value="3" required>
                </div>
                <div class="form-group">
                    <label>Preferred Notification Method:</label>
                    <div>
                        <label>
                            <input type="checkbox" value="email" class="notification-checkbox"> Email
                        </label>
                        <label>
                            <input type="checkbox" value="sms" class="notification-checkbox"> SMS
                        </label>
                        <label>
                            <input type="checkbox" value="app" class="notification-checkbox"> In-App Notification
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="notificationFrequency">How often to notify:</label>
                    <select class="form-control" id="notificationFrequency" required>
                        <option value="once">Once</option>
                        <option value="daily">Daily until expired</option>
                        <option value="weekly">Weekly until expired</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Save Preferences</button>
            </form>
             </div>
     </div>
</template>

<script>

</script>
