const template = `
<div class="swiper-slide" style="width: 100px; height: 150px;">
    <div class="card shadow-none" @click="onClicked()" style="width: 100px; vertical-align: middle; text-align: center;">
        <img :src="group.image" style="height: 100px; width:auto; object-fit: contain; text-align: center;">
        <img v-if="group.hasPreviousNew" src="images/previous-new.png" class="no-border banner-overlay" style="width: 50px;" />
        <img v-if="group.hasNew" src="images/new.png" class="no-border banner-overlay" style="width: 50px;" />
        <div class="card-text">
            {{ group.title }}
        </div>
    </div>
</div>
`;

export default {
    props: ['group'],
    data: function () {
        return {
        }
    },
    methods: {
        onClicked() {
            this.$emit('clicked', this.group.id)
        }
    },
    mounted: function () {
    },
    template: template,
}
