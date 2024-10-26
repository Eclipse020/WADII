<template>
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
</template>

<script>

</script>

<style scoped>
template {
   font-family: 'Roboto', sans-serif;
   background-color: #f1f1f1;
   padding: 40px 0;
}

.notification-form {
   max-width: 500px;
   margin: 20px auto;
   background-color: #fff;
   padding: 30px;
   border-radius: 15px;
   box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
   transition: all 0.3s ease;
   text-align: left;
}

.notification-form:hover {
   box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.form-title {
   text-align: center;
   font-weight: bold;
   font-size: 24px;
   color: #333;
   margin-bottom: 25px;
}

.form-group label {
   font-size: 16px;
   font-weight: 500;
   color: #555;
   margin-bottom: 8px; /* Added space between label and input */
   display: block; /* Ensure label takes up full width */
}

.form-group {
   margin-bottom: 20px; /* Space between form fields */
}

.form-control {
   border-radius: 8px;
   border: 1px solid #ccc;
   padding: 10px;
   font-size: 15px;
   transition: border-color 0.3s ease;
   line-height: 1.6; /* Increased line spacing */
}

.form-control:focus {
   border-color: #007bff;
   box-shadow: none;
}

.btn-primary {
   background-color: #007bff;
   border: none;
   border-radius: 8px;
   padding: 10px 15px;
   font-size: 16px;
   font-weight: 600;
   transition: background-color 0.3s ease;
}

.btn-primary:hover {
   background-color: #0056b3;
}

.btn-block {
   width: 100%;
   margin-top: 20px;
}

.notification-form small {
   display: block;
   text-align: center;
   color: #888;
   margin-top: 20px;
}

@media (max-width: 768px) {
   .notification-form {
       padding: 20px;
   }

   .form-title {
       font-size: 22px;
   }

   .btn-primary {
       font-size: 14px;
   }
}
</style>