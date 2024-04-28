const template = `
<div v-show="isVisible" class="swiper album-swiper" ref="album-swiper-container">
    <div class="swiper-wrapper">
        <slot></slot>
    </div>
    <div class="swiper-pagination" ref="sw-pager"></div>
</div>
`;

export default {
    props: ["initialVisibility",],
    data: function () {
        return {
            isVisible: this.initialVisibility
        }
    },
    methods: {
        setVisibility(isVisible) {
            this.isVisible = isVisible;
        },
        selectCard: function (cardIndex) {
            this.swiper.slideTo(cardIndex);
        }
    },
    mounted: function () {
        this.swiper = new Swiper(this.$refs["album-swiper-container"], {
            slidesPerView: 'auto',
            spaceBetween: 10,
            centeredSlides: true,

            grabCursor: true,
            updateOnWindowResize: true,
            observer: true,
            observeParents: true,

            // Optional parameters
            direction: 'horizontal',
            //loop: true,

            effect: 'coverflow',
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
            pagination: {
                el: this.$refs["sw-pager"],
                type: 'fraction',
            },
        });
    },
    template: template,
}
